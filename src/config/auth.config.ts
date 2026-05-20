import { type NextAuthOptions, type DefaultSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from '@/lib/database/database'
import User, { IUser } from '@/models/User'
import Session from '@/models/Session'
import crypto from 'crypto'
import { LOGGER } from '@/config/logger'

// Type augmentation para agregar 'id' a session.user
declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: {
            id: string;
        } & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string;
    }
}

const secret = process.env.NEXTAUTH_SECRET;

const googleOauthConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not defined');
}

export const authOptions: NextAuthOptions = {
    secret: secret,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "ejemplo@studium.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email y contraseña requeridos");
                }

                try {
                    await connectDB();
                    const user = await User.findOne({ email: credentials.email }).select('+password');

                    if (!user) {
                        throw new Error("Usuario o contraseña incorrectos");
                    }

                    const isPasswordValid = await user.comparePassword(credentials.password);

                    //Importante: no dar pistas sobre si el email o la contraseña son incorrectos, por seguridad...
                    if (!isPasswordValid) {
                        throw new Error("Usuario o contraseña incorrectos");
                    }

                    return {
                        id: user._id,
                        email: user.email,
                        name: user.firstName,
                        image: user.profile?.profilePicture || null,
                    };
                } catch (error: any) {
                    throw new Error(error.message || "Error al autenticar");
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        })
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 días, podría ser 7...
    },
    jwt: {
        secret: secret,
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // Asignar id cuando el usuario se autentica por primera vez (todos los providers)
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }

            // Manejar Google OAuth - crear usuario en BD si no existe
            if (googleOauthConfigured && account?.provider === 'google' && user) {
                try {
                    await connectDB();
                    let existingUser: IUser | null = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        //Registramos nuevo usuario en la bbdd y agregamos el thirdparty
                        const thirdPartyData = {
                            provider: 'google',
                            externalId: user.id,
                            accessToken: account.access_token,
                            refreshToken: account.refresh_token,
                            expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : undefined,
                            email: user.email,
                            name: user.name,
                            profilePicture: user.image,
                        };
                        existingUser = await User.create({
                            email: user.email,
                            password: crypto.randomBytes(32).toString('hex'), // Contraseña aleatoria para usuarios OAuth
                            firstName: user.name?.split(" ")?.[0] || 'Usuario',
                            profile: {
                                lastName: user.name?.split(" ")?.slice(1).join(" ") || '',
                                profilePicture: user.image,
                            },
                            role: 'student',
                            thirdparty: [thirdPartyData],
                        });
                        LOGGER.info(`Nuevo usuario creado a través de Google OAuth: ${existingUser?.email}`);
                    } else {
                        LOGGER.info(`Usuario existente autenticado a través de Google OAuth: ${existingUser?.email}`);
                    }
                    // Actualizar token con el ID del usuario en BD
                    token.id = existingUser?._id.toString();
                    token.email = existingUser?.email;

                } catch (error: Error | any) {
                    LOGGER.error('Error manejando usuario de Google OAuth:', error);
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                if (token?.id) {
                    session.user.id = token.id as string;
                }
                if (token?.email) {
                    session.user.email = token.email as string;
                }
            }
            return session;
        }
    },
    events: {
        async signIn({ user, account }) {

            // Crear/actualizar registro de sesión en BD cuando inician sesión
            if (user?.id) {
                try {
                    await connectDB();
                    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

                    // Buscar sesión existente por userId, si no existe crear nueva
                    const existingSession = await Session.findOne({ userId: user.id, revokedAt: null });
                    
                    if (existingSession) {
                        // Actualizar sesión existente: resetear expiration
                        existingSession.expires = expires;
                        await existingSession.save();
                        LOGGER.info(`Sesión actualizada para el usuario: ${user.id}`);
                    } else {
                        // Crear nueva sesión (generar token para referencia)
                        const sessionToken = crypto.randomBytes(32).toString('hex');
                        await Session.create({
                            sessionToken,
                            userId: user.id,
                            expires,
                        });
                        LOGGER.info(`Sesión creada para el usuario: ${user.id}`);
                    }
                } catch (error: Error | any) {
                    LOGGER.error('Error manejando sesión:', error);
                }
            }
        },
        async signOut() {
            // Limpiar sesiones expiradas
            try {
                await connectDB();
                await Session.deleteMany({ expires: { $lt: new Date() } });
                LOGGER.info('Sesiones expiradas limpiadas');
            } catch (error: any) {
                LOGGER.error(`Error limpiando sesiones expiradas: ${error}`);
            }
        }
    },
    //Paginas personalizadas para login y error, falta registro
    pages: {
        signIn: '/auth/login',
        error: '/auth/login',
    },
};