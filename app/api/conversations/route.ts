import { auth } from '@/lib/auth'
import { getConversations } from '@/app/actions/conversations'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const conversations = await getConversations()
    
    return new Response(JSON.stringify(conversations), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[v0] Error fetching conversations:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch conversations' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
