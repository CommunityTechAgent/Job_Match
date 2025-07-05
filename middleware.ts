import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/test") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/icons/")
  ) {
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req, res })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/profile", "/settings", "/matches"]
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    if (isProtectedRoute && !session) {
      console.log(`Redirecting unauthenticated user from ${pathname} to /`)
      return NextResponse.redirect(new URL("/", req.url))
    }

    // Redirect authenticated users away from auth pages
    const authRoutes = ["/auth/signin", "/auth/signup"]
    const isAuthRoute = authRoutes.includes(pathname)

    if (isAuthRoute && session) {
      console.log(`Redirecting authenticated user from ${pathname} to /dashboard`)
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
