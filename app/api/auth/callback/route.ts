import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(
          new URL(`/auth/auth-code-error?error=${encodeURIComponent(error.message)}`, requestUrl.origin),
        )
      }
    } catch (error) {
      console.error("Auth callback exception:", error)
      return NextResponse.redirect(
        new URL(`/auth/auth-code-error?error=${encodeURIComponent("Authentication failed")}`, requestUrl.origin),
      )
    }
  }

  // Redirect to dashboard after successful authentication
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
}
