import { NextResponse } from 'next/server'

export async function GET() {
  const robots = `... Content omitted to save context. You MUST use Read to get the full and current version before editing ...`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
