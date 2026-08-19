import { AuthForm } from '@/components/auth-form'

export const metadata = {
  title: 'Sign In - Kanglei AI',
  description: 'Sign in to Kanglei AI founded by Rakesh Irom',
}

export default function SignInPage() {
  return <AuthForm mode="sign-in" />
}
