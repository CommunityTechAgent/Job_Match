import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = (globalThis as any)?.process?.env?.AIRTABLE_TOKEN
  const baseId = (globalThis as any)?.process?.env?.AIRTABLE_BASE_ID
  const tableName = (globalThis as any)?.process?.env?.AIRTABLE_TABLE_NAME

  // Validate environment variables
  if (!token || !baseId || !tableName) {
    return NextResponse.json(
      { error: 'Missing required environment variables (AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME)' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      console.error('Airtable API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch from Airtable', status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data.records)
  } catch (error) {
    console.error("Airtable fetch error:", error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support POST method for flexibility
export async function POST(request: NextRequest) {
  return GET(request)
} 