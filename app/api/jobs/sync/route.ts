import { NextRequest, NextResponse } from 'next/server'
import { syncJobsFromAirtable, getSyncStats, getLastSyncDate } from '@/lib/syncJobs'

export async function POST(request: NextRequest) {
  try {
    // Check if it's a cron job request (optional security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting manual job sync...')
    
    // Run the sync
    const result = await syncJobsFromAirtable()
    
    // Get additional stats
    const stats = await getSyncStats()
    const lastSyncDate = await getLastSyncDate()
    
    const response = {
      success: true,
      result,
      stats,
      lastSyncDate,
      timestamp: new Date().toISOString()
    }
    
    console.log('Manual sync completed:', response)
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Manual sync failed:', error)
    
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

export async function GET() {
  try {
    // Get sync statistics
    const stats = await getSyncStats()
    const lastSyncDate = await getLastSyncDate()
    
    return NextResponse.json({
      success: true,
      stats,
      lastSyncDate,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Failed to get sync stats:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 