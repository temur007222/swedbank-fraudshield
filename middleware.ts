import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const roleRouteMap: Record<string, string> = {
  '/bank': 'BANK_ANALYST',
  '/telecom': 'TELECOM_OPERATOR',
  '/authority': 'AUTHORITY_OFFICER',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if it's a protected route
  const isShared = pathname.startsWith('/shared')
  const protectedPrefixes = Object.keys(roleRouteMap)
  const isRoleProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  )

  if (!isRoleProtected && !isShared) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Shared routes are accessible to all authenticated users
  if (isShared) {
    return NextResponse.next()
  }

  const requiredRole = protectedPrefixes.find((prefix) =>
    pathname.startsWith(prefix)
  )

  if (requiredRole && token.role !== roleRouteMap[requiredRole]) {
    // Redirect to the correct dashboard for the user's role
    const roleToRoute: Record<string, string> = {
      BANK_ANALYST: '/bank',
      TELECOM_OPERATOR: '/telecom',
      AUTHORITY_OFFICER: '/authority',
    }
    const correctRoute = roleToRoute[token.role as string] || '/bank'
    return NextResponse.redirect(new URL(correctRoute, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/bank/:path*', '/telecom/:path*', '/authority/:path*', '/shared/:path*'],
}
