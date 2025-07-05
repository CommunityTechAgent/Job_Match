import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    // Test basic environment variables
    const envVars = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anthropicKey: !!process.env.ANTHROPIC_API_KEY,
      nodeEnv: process.env.NODE_ENV,
    }

    // Test Supabase connection
    let supabaseStatus = "not_tested"
    try {
      const supabase = createSupabaseServerClient()
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        supabaseStatus = `error: ${error.message}`
      } else {
        supabaseStatus = "connected"
      }
    } catch (err) {
      supabaseStatus = `connection_error: ${err instanceof Error ? err.message : "Unknown error"}`
    }

    return NextResponse.json({
      success: true,
      message: "Test endpoint working",
      environment: envVars,
      supabase: supabaseStatus,
      timestamp: new Date().toISOString(),
      url: request.url,
      headers: {
        host: request.headers.get("host"),
        "user-agent": request.headers.get("user-agent"),
        origin: request.headers.get("origin"),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
