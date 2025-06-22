import { NextRequest, NextResponse } from 'next/server'
import { syncJobsFromAirtable } from '@/lib/syncJobs'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret) {
      console.warn('CRON_SECRET not set, skipping authorization check')
    } else if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Invalid cron authorization')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting automated job sync via cron...')
    
    // Run the sync
    const result = await syncJobsFromAirtable()
    
    const response = {
      success: true,
      result,
      timestamp: new Date().toISOString()
    }
    
    console.log('Automated sync completed:', response)
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Automated sync failed:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'Cron endpoint is active',
    timestamp: new Date().toISOString()
  })
} 