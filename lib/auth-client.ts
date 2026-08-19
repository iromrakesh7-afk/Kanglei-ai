import { createAuthClient } from 'better-auth/react'

function normalizeBaseURL(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

const configuredBaseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  process.env.V0_RUNTIME_URL ||
  'http://localhost:3000'

export const authClient = createAuthClient({
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : normalizeBaseURL(configuredBaseURL),
})

export const { useSession, signOut, signIn, signUp } = authClient
