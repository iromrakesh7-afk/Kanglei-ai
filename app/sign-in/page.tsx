import { SignIn } from '@clerk/nextjs'

export const metadata = {
  title: 'Sign In - Kanglei AI',
  description: 'Sign in to Kanglei AI',
}

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </main>
  )
}
