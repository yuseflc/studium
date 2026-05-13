import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/database';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                };
            },
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                
                await connectDB();
                const user = await User.findOne({ email: credentials.email }).select('+password');
                
                if (!user) {
                    return null;
                }
                
                const isPasswordValid = await user.comparePassword(credentials.password);
                if (!isPasswordValid) {
                    return null;
                }
                
                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.firstName,
                };
            }
        })
    ],
    
    session: {
        strategy: 'jwt',
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/login',
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
