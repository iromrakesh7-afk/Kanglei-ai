import { createAuthClient } from 'better-auth/react'
import { oauth2Client } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.BETTER_AUTH_URL ||
        process.env.VERCEL_PROJECT_PRODUCTION_URL ||
        process.env.VERCEL_URL ||
        process.env.V0_RUNTIME_URL ||
        'http://localhost:3000'),
  plugins: [oauth2Client()],
})

export const { useSession, signOut, signIn, signUp } = authClient
