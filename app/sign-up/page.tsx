import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'

export const metadata = {
  title: 'Sign Up - Kanglei AI',
  description: 'Create your account on Kanglei AI founded by Rakesh Irom',
}

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) {
    redirect('/chat')
  }
  
  return <AuthForm mode="sign-up" />
}
