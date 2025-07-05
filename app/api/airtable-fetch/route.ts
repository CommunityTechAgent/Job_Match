import { NextRequest, NextResponse } from 'next/server'
import { fetchActiveJobs } from '@/lib/airtable'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local, as this route might be called in a serverless context
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

export async function GET(request: NextRequest) {
  try {
    const records = await fetchActiveJobs()
    return NextResponse.json(records)
  } catch (error) {
    console.error("Airtable fetch error in API route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch from Airtable' },
      { status: 500 }
    )
  }
}

// Also support POST method for flexibility
export async function POST(request: NextRequest) {
  return GET(request)
}
