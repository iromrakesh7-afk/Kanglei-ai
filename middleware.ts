import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware(
  async () => {},
  {
    publishableKey:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
      'pk_test_d2VsY29tZWQtYnVycm8tMjI4NS5jbGVyay5hY2NvdW50cy5kZXYk',
  },
)

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
