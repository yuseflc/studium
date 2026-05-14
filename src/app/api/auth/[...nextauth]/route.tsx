import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from '@/lib/database'
import User from '@/models/User'
import Session from '@/models/Session'
import crypto from 'crypto'
import { LOGGER } from '@/config/logger'

const secret = process.env.NEXTAUTH_SECRET;
// Si no hay secret, lanzar error para evitar problemas de seguridad
if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not defined');
}
// Opciones de seguridad de NextAuth, incluyendo providers, callbacks y eventos
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
                        throw new Error("Usuario no encontrado");
                    }

                    const isPasswordValid = await user.comparePassword(credentials.password);

                    if (!isPasswordValid) {
                        throw new Error("Contraseña incorrecta");
                    }

                    return {
                        id: user._id.toString(),
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
            // Falta agregar logica para manejar usuarios que inician sesión con Google por primera vez (crear usuario en BD)

            // Solo para el provider de credenciales, se agrega el id del usuario a la sesión JWT
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.iat = Math.floor(Date.now() / 1000);
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                // Error de tipado aquí, pero se asume que token tiene id y email
                session.user.id = token.id as string;
                session.user.email = token.email as string;
            }
            return session;
        }
    },
    events: {
        async signIn({ user, account }) {
            // Crear registro de sesión en BD cuando inician sesión
            if (user?.email) {
                try {
                    await connectDB();
                    const sessionToken = crypto.randomBytes(32).toString('hex');
                    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

                    await Session.create({
                        sessionToken,
                        userId: user.id,
                        expires,
                    });

                    LOGGER.info(`Sesión creada para el usuario: ${user.email}`);
                } catch (error : any) {
                    LOGGER.error('Error creando registro de sesión:', error);
                }
            }
        },
        async signOut() {
            // Limpiar sesiones expiradas
            try {
                await connectDB();
                await Session.deleteMany({ expires: { $lt: new Date() } });
                LOGGER.info('Sesiones expiradas limpiadas');
            } catch (error) {
                console.error('EError limpiando sesiones expiradas:', error);
            }
        }
    },
    //Paginas personalizadas para login y error, falta registro
    pages: {
        signIn: '/auth/login',
        error: '/auth/login',
    },
}
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };