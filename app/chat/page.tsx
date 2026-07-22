import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createConversation } from '@/app/actions/conversations'

export const metadata = {
  title: 'Chat - Kanglei AI',
  description: 'Chat with Kanglei AI founded by Rakesh Irom',
}

export default async function ChatPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  // If logged in, create a new conversation and redirect
  if (session?.user) {
    const newConv = await createConversation('New Chat')
    redirect(`/chat/${newConv.id}`)
  }

  // If not logged in, redirect to sign-in
  redirect('/sign-in')
}
