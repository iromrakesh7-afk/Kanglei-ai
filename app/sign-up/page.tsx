import { SignUp } from '@clerk/nextjs'

export const metadata = {
  title: 'Sign Up - Kanglei AI',
  description: 'Create your Kanglei AI account',
}

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </main>
  )
}
