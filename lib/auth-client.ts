import { createAuthClient } from 'better-auth/react'

function normalizeBaseURL(value: string) {
  const trimmed = value.trim()
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  return new URL(withProtocol).origin
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
