import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractResumeText, validateResumeContent, getFileMetadata } from '@/lib/resumeParser'
import { extractSkillsFromResume, determineExperienceLevel, testAIConfiguration } from '@/lib/aiService'
import { updateResumeParsingStatus, updateAiSkillsExtractionStatus } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // For now, we'll skip authentication check and use profileId directly
    // In production, you should implement proper authentication
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const formData = await request.formData()
    const file = formData.get('file') as File
    const profileId = formData.get('profileId') as string

    if (!file || !profileId) {
      return NextResponse.json({ 
        error: 'File and profileId are required' 
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF, DOCX, and DOC files are supported.' 
      }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // Get file buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileMetadata = getFileMetadata(fileBuffer, file.name)

    // Step 1: Update status to processing
    await updateResumeParsingStatus(profileId, 'processing')

    // Step 2: Extract text from resume
    const extractionResult = await extractResumeText(fileBuffer, file.name)
    
    if (!extractionResult.success) {
      await updateResumeParsingStatus(profileId, 'failed')
      return NextResponse.json({ 
        error: 'Failed to extract text from resume',
        details: extractionResult.error 
      }, { status: 400 })
    }

    const parsedResume = extractionResult.data!
    
    // Step 3: Validate resume content
    const validation = validateResumeContent(parsedResume.text)
    
    if (!validation.isValid) {
      await updateResumeParsingStatus(
        profileId, 
        'failed',
        parsedResume.text,
        parsedResume.wordCount,
        parsedResume.pages,
        parsedResume.format,
        validation.confidence
      )
      return NextResponse.json({ 
        error: 'Invalid resume content',
        details: validation.reasons,
        confidence: validation.confidence
      }, { status: 400 })
    }

    // Step 4: Update database with extracted text
    await updateResumeParsingStatus(
      profileId,
      'completed',
      parsedResume.text,
      parsedResume.wordCount,
      parsedResume.pages,
      parsedResume.format,
      validation.confidence
    )

    // Step 5: Extract skills using AI (async - don't wait for completion)
    processSkillsExtraction(profileId, parsedResume.text).catch(error => {
      console.error('Skills extraction failed:', error)
    })

    return NextResponse.json({
      success: true,
      message: 'Resume processed successfully',
      data: {
        wordCount: parsedResume.wordCount,
        pages: parsedResume.pages,
        format: parsedResume.format,
        validationConfidence: validation.confidence,
        validationReasons: validation.reasons,
        skillsExtractionStatus: 'processing'
      }
    })

  } catch (error) {
    console.error('Resume processing error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Async function to handle skills extraction
async function processSkillsExtraction(profileId: string, resumeText: string) {
  try {
    // Extract skills using AI
    const skillsResult = await extractSkillsFromResume(resumeText)
    
    if (skillsResult.error) {
      await updateAiSkillsExtractionStatus(profileId, false)
      console.error('Skills extraction failed:', skillsResult.error)
      return
    }

    // Determine experience level
    const experienceResult = await determineExperienceLevel(resumeText)
    
    // Prepare skills confidence data
    const skillsConfidence = {
      skills: skillsResult.confidence,
      jobTitle: skillsResult.jobTitle,
      experienceLevel: experienceResult.experienceLevel || skillsResult.experienceLevel,
      extractionDate: new Date().toISOString(),
      totalSkills: skillsResult.skills.length
    }

    // Update database with extracted skills
    await updateAiSkillsExtractionStatus(
      profileId,
      true,
      skillsResult.jobTitle,
      experienceResult.experienceLevel || skillsResult.experienceLevel,
      skillsConfidence
    )

    // Update user's skills array in profile
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase
      .from('profiles')
      .update({ 
        skills: skillsResult.skills,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)

    console.log(`Skills extraction completed for profile ${profileId}:`, {
      skillsCount: skillsResult.skills.length,
      jobTitle: skillsResult.jobTitle,
      experienceLevel: experienceResult.experienceLevel
    })

  } catch (error) {
    console.error('Skills extraction error:', error)
    await updateAiSkillsExtractionStatus(profileId, false)
  }
}

// GET endpoint to check processing status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const test = searchParams.get('test')
    const profileId = searchParams.get('profileId')

    // Handle test configuration check
    if (test === 'config') {
      try {
        const isConfigured = await testAIConfiguration()
        
        return NextResponse.json({
          success: isConfigured,
          message: isConfigured ? 'AI service configured correctly' : 'AI service not configured',
          error: isConfigured ? null : 'Missing API key or configuration'
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: 'AI service configuration test failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // For now, we'll skip authentication check
    // In production, you should implement proper authentication
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 })
    }

    // Get processing status from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        resume_parsing_status,
        resume_parsed_at,
        resume_validation_confidence,
        resume_word_count,
        resume_pages,
        resume_format,
        ai_skills_extracted,
        ai_skills_extraction_date,
        ai_extracted_job_title,
        ai_extracted_experience_level,
        skills
      `)
      .eq('id', profileId)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        resumeParsing: {
          status: profile.resume_parsing_status,
          parsedAt: profile.resume_parsed_at,
          validationConfidence: profile.resume_validation_confidence,
          wordCount: profile.resume_word_count,
          pages: profile.resume_pages,
          format: profile.resume_format
        },
        aiSkillsExtraction: {
          extracted: profile.ai_skills_extracted,
          extractionDate: profile.ai_skills_extraction_date,
          jobTitle: profile.ai_extracted_job_title,
          experienceLevel: profile.ai_extracted_experience_level,
          skills: profile.skills || []
        },
        overallStatus: getOverallStatus(profile)
      }
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

function getOverallStatus(profile: any): string {
  if (profile.resume_parsing_status === 'failed') {
    return 'failed'
  }
  
  if (profile.resume_parsing_status === 'processing') {
    return 'processing'
  }
  
  if (profile.resume_parsing_status === 'completed' && profile.ai_skills_extracted) {
    return 'fully_processed'
  }
  
  if (profile.resume_parsing_status === 'completed' && !profile.ai_skills_extracted) {
    return 'text_extracted'
  }
  
  return 'pending'
} 