import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  const isBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|slackbot/i.test(userAgent)

  // Allow all bots to crawl public pages
  if (isBot) {
    return NextResponse.next()
  }

  // Allow all public routes
  const pathname = request.nextUrl.pathname
  if (pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up' || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Let other routes continue normally
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|google.*\\.html).*)',
  ],
}
