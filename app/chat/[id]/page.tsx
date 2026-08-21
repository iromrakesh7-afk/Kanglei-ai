import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ChatInterface } from '@/components/chat-interface'
import {
  getConversation,
  getMessages,
  createConversation,
  deleteConversation,
} from '@/app/actions/conversations'

interface ChatPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ChatPageProps) {
  const { id } = await params
  const conversation = await getConversation(id)
  return {
    title: `${conversation.title} - Kanglei AI`,
  }
}

export default async function ChatDetailPage({ params }: ChatPageProps) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    redirect('/sign-in')
  }

  const { id } = await params
  const conversation = await getConversation(id)
  const messages = await getMessages(id)

  const handleNewChat = async () => {
    'use server'
    const newConv = await createConversation('New Chat')
    redirect(`/chat/${newConv.id}`)
  }

  const handleDeleteChat = async () => {
    'use server'
    await deleteConversation(id)
    redirect('/chat')
  }

  // Use valid Groq model, fallback to default if stored model is invalid or decommissioned
  const validModel = 
    conversation.model && conversation.model.startsWith('groq/') && !conversation.model.includes('mixtral') && !conversation.model.includes('llama-3.1') && !conversation.model.includes('llama-2')
      ? conversation.model
      : 'groq/openai/gpt-oss-120b'

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden max-h-screen">
      {/* Chat Interface - No sidebar, clean layout */}
      <ChatInterface
        conversationId={id}
        conversationTitle={conversation.title}
        initialMessages={messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))}
        model={validModel}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />
    </div>
  )
}
