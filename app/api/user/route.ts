import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({
      headers: headersList,
    })

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return Response.json({
      user: session.user,
    })
  } catch (error) {
    console.error('[v0] Error fetching user:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
