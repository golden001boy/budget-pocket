import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import {
  rateLimit, getClientIp, loginRateLimitKey, accountLoginRateLimitKey,
  LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_SECONDS, ACCOUNT_LOGIN_ATTEMPT_LIMIT,
} from './rateLimit';
import { logSensitiveAction } from './auditLog';
import { verifyTotpToken, consumeRecoveryCode } from './mfa';
import { decryptSecret } from './mfaCrypto';

// 7 days rather than 30 (story 15.8, auth hardening): bounds how long a
// stolen/leaked session token stays valid if the device goes unused. Active
// users don't notice — NextAuth silently re-issues the token on activity
// (default updateAge), so this only shortens the *idle* exposure window.
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: SESSION_MAX_AGE_SECONDS },
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
        // Story 15.32 (ADR-008 residual, MFA): optional — only required
        // when the account has mfaEnabled. Left blank on the first submit;
        // the login form re-submits with it once it sees the MFA_REQUIRED
        // error below.
        totp:     { label: 'Code de vérification', type: 'text' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = getClientIp(req?.headers);
        const limit = await rateLimit(loginRateLimitKey(credentials.email, ip), LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_SECONDS);
        if (!limit.success) {
          console.warn(`[auth] rate limited login attempt for ${credentials.email} from ${ip}`);
          logSensitiveAction({ action: 'login_failure', email: credentials.email, ip, reason: 'rate_limited_ip' });
          return null;
        }

        const accountLimit = await rateLimit(accountLoginRateLimitKey(credentials.email), ACCOUNT_LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_SECONDS);
        if (!accountLimit.success) {
          console.warn(`[auth] account-wide rate limit hit for ${credentials.email} (last attempt from ${ip})`);
          logSensitiveAction({ action: 'login_failure', email: credentials.email, ip, reason: 'rate_limited_account' });
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user) {
          logSensitiveAction({ action: 'login_failure', email: credentials.email, ip, reason: 'no_such_account' });
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          logSensitiveAction({ action: 'login_failure', userId: user.id, email: user.email, ip, reason: 'wrong_password' });
          return null;
        }

        if (user.mfaEnabled && user.mfaSecret) {
          const totp = credentials.totp?.trim();
          if (!totp) {
            // Thrown (not returned null) so the login page can tell "wrong
            // password" apart from "needs a second factor" — NextAuth
            // surfaces a thrown Error's message as `result.error` on the
            // client, unlike a `null` return which always maps to the
            // generic CredentialsSignin error.
            throw new Error('MFA_REQUIRED');
          }

          const secret = decryptSecret(user.mfaSecret);
          const totpValid = verifyTotpToken(totp, secret);
          if (!totpValid) {
            const remaining = await consumeRecoveryCode(totp, user.mfaRecoveryCodes);
            if (!remaining) {
              logSensitiveAction({ action: 'mfa_challenge_failed', userId: user.id, email: user.email, ip, reason: 'login' });
              throw new Error('MFA_INVALID');
            }
            // Recovery codes are one-time use — persist the reduced set.
            await prisma.user.update({ where: { id: user.id }, data: { mfaRecoveryCodes: remaining } });
          }
        }

        logSensitiveAction({ action: 'login_success', userId: user.id, email: user.email, ip });

        return {
          id:            user.id,
          email:         user.email,
          name:          user.name,
          role:          user.role,
          currency:      user.currency,
          onboardingDone: user.onboardingDone,
          emailVerified: !!user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id             = user.id;
        token.role           = (user as any).role;
        token.currency       = (user as any).currency;
        token.onboardingDone = (user as any).onboardingDone;
        token.emailVerified  = (user as any).emailVerified;
      }
      // The JWT is stateless and only refreshed from `user` on sign-in — a
      // verification that happens later in the same session (story 15.12)
      // wouldn't otherwise be reflected until the token naturally expires.
      // The verify-email page calls the client `update()` hook after a
      // successful verification specifically to hit this branch.
      if (trigger === 'update') {
        const current = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (current) token.emailVerified = !!current.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id             = token.id as string;
        session.user.role           = token.role as any;
        session.user.currency       = token.currency as any;
        session.user.onboardingDone = token.onboardingDone as boolean;
        session.user.emailVerified  = token.emailVerified as boolean;
      }
      return session;
    },
  },
};
