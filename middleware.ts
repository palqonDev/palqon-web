// app/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''

  if (auth.startsWith('Basic ')) {
    try {
      const encoded = auth.split(' ')[1]
      const decoded = atob(encoded) // Edge runtime supporta atob
      const [user, pass] = decoded.split(':')

      if (user === process.env.BASIC_USER && pass === process.env.BASIC_PASS) {
        return NextResponse.next()
      }
    } catch (e) {
      // ignora e continua a richiedere auth
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Protected"' },
  })
}

export const config = {
  matcher: ['/:path*'],
}
