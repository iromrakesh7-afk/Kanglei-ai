import { createAuthClient } from 'better-auth/react'

const normalizeBaseUrl = (value: string | undefined) => {
  if (!value) return undefined
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

export const authClient = createAuthClient({
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : normalizeBaseUrl(process.env.BETTER_AUTH_URL) ??
        normalizeBaseUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
        normalizeBaseUrl(process.env.VERCEL_URL) ??
        normalizeBaseUrl(process.env.V0_RUNTIME_URL) ??
        'http://localhost:3000',
})

export const { useSession, signOut, signIn, signUp } = authClient
