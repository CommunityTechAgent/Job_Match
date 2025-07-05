import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Update user's email preferences to unsubscribe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({ 
        email_notifications_enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single()

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
    }

    // Log the unsubscribe action
    if (profile) {
      await supabase
        .from('notifications')
        .insert({
          user_id: profile.user_id,
          type: 'system',
          title: 'Email notifications disabled',
          content: 'User unsubscribed from email notifications',
          metadata: { action: 'unsubscribe', email }
        })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully unsubscribed from email notifications' 
    })

  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    // Check if user exists and get their notification preferences
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, user_id, email, email_notifications_enabled')
      .eq('email', email)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      email: profile.email,
      notifications_enabled: profile.email_notifications_enabled || false
    })

  } catch (error) {
    console.error('Unsubscribe status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check unsubscribe status' }, 
      { status: 500 }
    )
  }
}
