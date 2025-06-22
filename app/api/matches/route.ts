import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { findJobMatches, getMatchRecommendations, getMatchStatistics, type MatchFilters } from '@/lib/matchingAlgorithm'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'matches' // 'matches', 'recommendations', 'statistics'
    const limit = parseInt(searchParams.get('limit') || '10')
    const minScore = parseInt(searchParams.get('minScore') || '0')
    const location = searchParams.get('location') || undefined
    const jobType = searchParams.get('jobType') || undefined
    const experienceLevel = searchParams.get('experienceLevel') || undefined
    const remoteOnly = searchParams.get('remoteOnly') === 'true'
    const search = searchParams.get('search') || undefined

    // Build filters
    const filters: MatchFilters = {
      limit,
      minScore: minScore > 0 ? minScore : undefined,
      location,
      jobType,
      experienceLevel,
      remoteOnly,
      search
    }

    let result

    switch (type) {
      case 'recommendations':
        result = await getMatchRecommendations(user.id, limit)
        break
      
      case 'statistics':
        result = await getMatchStatistics(user.id)
        break
      
      case 'matches':
      default:
        result = await findJobMatches(user.id, filters)
        break
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in matches API:', error)
    
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

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body for filters
    const body = await request.json()
    const filters: MatchFilters = {
      limit: body.limit || 10,
      minScore: body.minScore || undefined,
      location: body.location || undefined,
      jobType: body.jobType || undefined,
      experienceLevel: body.experienceLevel || undefined,
      remoteOnly: body.remoteOnly || false,
      search: body.search || undefined
    }

    const result = await findJobMatches(user.id, filters)

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in matches API POST:', error)
    
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