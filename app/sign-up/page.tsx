import { AuthForm } from '@/components/auth-form'

export const metadata = {
  title: 'Sign Up - Kanglei AI',
  description: 'Create your account on Kanglei AI founded by Rakesh Irom',
}

export default function SignUpPage() {
  return <AuthForm mode="sign-up" />
}
