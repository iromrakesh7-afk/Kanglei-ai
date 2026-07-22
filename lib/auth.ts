import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

// Ensure required environment variables are set
if (!process.env.DATABASE_URL) {
  throw new Error('[v0] DATABASE_URL is not set - authentication will not work')
}

if (!process.env.BETTER_AUTH_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[v0] BETTER_AUTH_SECRET is required in production')
  }
  console.warn('[v0] BETTER_AUTH_SECRET is not set - using fallback for development')
}

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL ?? 'http://localhost:3000'),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://kangleiai.in',
    'https://kangleiai.in',
    'http://www.kangleiai.in',
    'https://www.kangleiai.in',
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
    // Allow v0 preview environments
    'https://vusercontent.net',
  ],
  advanced: {
    disableCSRFCheck: process.env.NODE_ENV === 'development',
    ...((process.env.NODE_ENV === 'development' || process.env.V0_RUNTIME_URL)
      ? {
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        }
      : {
          defaultCookieAttributes: {
            sameSite: 'lax' as const,
            secure: true,
          },
        }),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
})
