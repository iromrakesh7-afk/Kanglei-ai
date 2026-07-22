import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { message } from '@/lib/db/schema'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { conversationId, messages: newMessages } = await req.json()

    if (!conversationId || !newMessages || !Array.isArray(newMessages)) {
      return new Response('Invalid request', { status: 400 })
    }

    // Insert each message
    for (const msg of newMessages) {
      await db.insert(message).values({
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        conversationId,
        userId: session.user.id,
        role: msg.role,
        content: msg.content,
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[v0] Messages API error:', error)
    return new Response('Failed to save messages', { status: 500 })
  }
}
