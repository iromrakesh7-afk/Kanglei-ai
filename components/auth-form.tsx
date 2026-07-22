'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Mail } from 'lucide-react'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)

    try {
      console.log('[v0] Starting Google OAuth')
      await authClient.signIn.oauth2({
        provider: 'google',
      })
    } catch (err) {
      console.error('[v0] Google OAuth error:', err)
      setLoading(false)
      const errorMessage = err instanceof Error ? err.message : 'Google sign-in failed'
      setError(errorMessage)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate inputs
    if (!email || !password) {
      setError('Email and password are required')
      setLoading(false)
      return
    }

    if (isSignUp && !name) {
      setError('Name is required for sign up')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      console.log('[v0] Starting auth request:', { isSignUp, email })
      
      const result = isSignUp
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password })

      console.log('[v0] Auth response:', result)

      if (result.error) {
        console.error('[v0] Auth error:', result.error)
        const errorMessage = result.error.message ?? 'Authentication failed'
        setError(errorMessage)
        setLoading(false)
        return
      }

      console.log('[v0] Auth successful, refreshing and redirecting to /chat')
      // First refresh to get the new session
      router.refresh()
      // Small delay to ensure session is available
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/chat')
    } catch (err) {
      console.error('[v0] Auth exception:', err)
      setLoading(false)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
    }
  }

  return (
    <main className="min-h-svh bg-slate-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm p-8 bg-slate-900 border-green-500 border-2">
        <div className="flex justify-center mb-6">
          <img src="/kanglei-logo.png" alt="Kanglei AI" className="h-16 w-16" />
        </div>
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Kanglei AI
          </h1>
          <p className="text-sm text-green-400 mt-1 font-medium">
            by Rakesh Irom
          </p>
          <p className="text-xs text-gray-400 mt-3">
            {isSignUp ? 'Create your account to get started' : 'Welcome back to Kanglei AI'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-gray-300">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="bg-slate-800 border-green-500 text-white placeholder-gray-500 focus:border-green-400 focus:ring-green-500"
                placeholder="Your name"
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="bg-slate-800 border-green-500 text-white placeholder-gray-500 focus:border-green-400 focus:ring-green-500"
              placeholder="your@email.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="bg-slate-800 border-green-500 text-white placeholder-gray-500 focus:border-green-400 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded border border-red-700" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-slate-900 text-gray-400">or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Mail size={18} />
            Google
          </Button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-6">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <Link
            href={isSignUp ? '/sign-in' : '/sign-up'}
            className="text-green-400 font-medium hover:text-green-300 underline-offset-4 hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </Card>
    </main>
  )
}
