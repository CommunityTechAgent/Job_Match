import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const test = searchParams.get('test')

    if (test === 'config') {
      // Simple configuration test
      const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY
      
      return NextResponse.json({
        success: hasAnthropicKey,
        message: hasAnthropicKey ? 'AI service configured correctly' : 'AI service not configured',
        error: hasAnthropicKey ? null : 'Missing ANTHROPIC_API_KEY'
      })
    }

    return NextResponse.json({ 
      message: 'Resume processing endpoint - POST to upload and process resume' 
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'API error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Resume processing endpoint ready for testing',
      data: {
        wordCount: 0,
        pages: 0,
        format: 'test',
        validationConfidence: 100,
        validationReasons: ['Test mode'],
        skillsExtractionStatus: 'ready'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 