import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { updateConversationTitle } from '@/app/actions/conversations'

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { conversationId, title } = await req.json()

    if (!conversationId || !title) {
      return new Response('Missing conversationId or title', { status: 400 })
    }

    await updateConversationTitle(conversationId, title)

    return Response.json({ success: true })
  } catch (error: any) {
    console.error('[v0] Update title error:', error?.message || error)
    return Response.json(
      { error: 'Failed to update conversation title' },
      { status: 500 }
    )
  }
}
