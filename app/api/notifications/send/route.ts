import { NextRequest, NextResponse } from 'next/server'
import { sendMatchNotification } from '@/lib/emailService'
import { supabase } from '@/lib/supabase'
import { getMatchRecommendations } from '@/lib/matchingAlgorithm'

export async function POST(request: NextRequest) {
  try {
    const { userId, limit = 10 } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get matches for the user
    const matches = await getMatchRecommendations(userId, limit)
    
    if (matches.length === 0) {
      return NextResponse.json({ message: 'No matches found for user' }, { status: 200 })
    }

    // Send email notification
    const emailResult = await sendMatchNotification(
      { 
        email: user.email, 
        name: `${user.first_name} ${user.last_name}`.trim() 
      }, 
      matches
    )

    // Log the notification
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'job_matches',
        title: `Found ${matches.length} new job matches`,
        content: `Sent email notification with ${matches.length} job matches`,
        metadata: { match_count: matches.length, email_sent: !!emailResult }
      })

    return NextResponse.json({ 
      success: true, 
      matches_sent: matches.length,
      email_result: emailResult 
    })

  } catch (error) {
    console.error('Notification send error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' }, 
      { status: 500 }
    )
  }
} 