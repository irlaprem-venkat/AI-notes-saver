import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({
    request: { headers: req.headers },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
        res = NextResponse.next({ request: { headers: req.headers } })
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options)
        )
      },
    },
  })

  // Refresh session if expired — required for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes — redirect unauthenticated users to login
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth', req.url))
    }
  }

  // Redirect already-authenticated users away from auth pages
  if (
    req.nextUrl.pathname.startsWith('/auth') &&
    !req.nextUrl.pathname.startsWith('/auth/callback')
  ) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // SECURITY HEADERS
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' *.supabase.co;
    style-src 'self' 'unsafe-inline' fonts.googleapis.com;
    img-src 'self' blob: data: *.supabase.co github.com avatars.githubusercontent.com lh3.googleusercontent.com grainy-gradients.vercel.app raw.githack.com raw.githubusercontent.com;
    font-src 'self' fonts.gstatic.com;
    connect-src 'self' *.supabase.co wss://*.supabase.co raw.githack.com raw.githubusercontent.com dl.polyhaven.org;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  res.headers.set('Content-Security-Policy', cspHeader)
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
