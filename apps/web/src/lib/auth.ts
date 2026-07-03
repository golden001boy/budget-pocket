import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn:  '/login',
    signOut: '/login',
    error:   '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',         type: 'email'    },
        password: { label: 'Mot de passe',  type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id:            user.id,
          email:         user.email,
          name:          user.name,
          role:          user.role,
          currency:      user.currency,
          onboardingDone: user.onboardingDone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id             = user.id;
        token.role           = (user as any).role;
        token.currency       = (user as any).currency;
        token.onboardingDone = (user as any).onboardingDone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id             = token.id as string;
        session.user.role           = token.role as any;
        session.user.currency       = token.currency as any;
        session.user.onboardingDone = token.onboardingDone as boolean;
      }
      return session;
    },
  },
};
