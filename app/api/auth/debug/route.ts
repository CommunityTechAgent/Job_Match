import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Test basic connection
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // Test database connection
    const { data: testData, error: dbError } = await supabase.from("profiles").select("count").limit(1)

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      session: session
        ? {
            user_id: session.user.id,
            email: session.user.email,
            expires_at: session.expires_at,
          }
        : null,
      sessionError: sessionError?.message || null,
      database: {
        connected: !dbError,
        error: dbError?.message || null,
      },
      environment: {
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing",
        supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
