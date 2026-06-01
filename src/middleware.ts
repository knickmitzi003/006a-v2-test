import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  // 只针对 /admin 路径
  if (pathname.startsWith('/admin')) {
    const auth_u = searchParams.get('auth_u')
    const auth_p = searchParams.get('auth_p')

    const validUser = process.env.AUTH_USER || 'admin'
    const validPass = process.env.AUTH_PASS || '123456'

    if (auth_u === validUser && auth_p === validPass) {
      const response = NextResponse.redirect(new URL('/admin', req.url))
      const authValue = btoa(`${validUser}:${validPass}`)

      response.cookies.set('internal_auth', authValue, {
        path: '/',
        maxAge: 86400,
        httpOnly: true,
      })
      return response
    }

    const basicAuth = req.headers.get('authorization')
    const cookieAuth = req.cookies.get('internal_auth')?.value

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')
      if (user === validUser && pwd === validPass) return NextResponse.next()
    }

    if (cookieAuth) {
      const [user, pwd] = atob(cookieAuth).split(':')
      if (user === validUser && pwd === validPass) return NextResponse.next()
    }

    return new NextResponse(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
}
