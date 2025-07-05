import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import { Buffer } from 'buffer'

export interface ParsedResume {
  text: string
  wordCount: number
  pages?: number
  format: 'pdf' | 'docx' | 'doc'
  extractionDate: string
  success: boolean
  error?: string
}

export interface ResumeParseResult {
  success: boolean
  data?: ParsedResume
  error?: string
}

/**
 * Extract text from PDF files
 */
async function extractTextFromPDF(fileBuffer: Buffer): Promise<ParsedResume> {
  try {
    const data = await pdfParse(fileBuffer)
    
    return {
      text: data.text,
      wordCount: data.text.split(/\s+/).length,
      pages: data.numpages,
      format: 'pdf',
      extractionDate: new Date().toISOString(),
      success: true
    }
  } catch (error) {
    return {
      text: '',
      wordCount: 0,
      format: 'pdf',
      extractionDate: new Date().toISOString(),
      success: false,
      error: error instanceof Error ? error.message : 'PDF parsing failed'
    }
  }
}

/**
 * Extract text from DOCX files
 */
async function extractTextFromDOCX(fileBuffer: Buffer): Promise<ParsedResume> {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer })
    
    return {
      text: result.value,
      wordCount: result.value.split(/\s+/).length,
      format: 'docx',
      extractionDate: new Date().toISOString(),
      success: true
    }
  } catch (error) {
    return {
      text: '',
      wordCount: 0,
      format: 'docx',
      extractionDate: new Date().toISOString(),
      success: false,
      error: error instanceof Error ? error.message : 'DOCX parsing failed'
    }
  }
}

/**
 * Extract text from DOC files (basic implementation)
 * Note: DOC parsing is limited and may not work for all files
 */
async function extractTextFromDOC(fileBuffer: Buffer): Promise<ParsedResume> {
  try {
    // For DOC files, we'll try to use mammoth as it can handle some DOC files
    const result = await mammoth.extractRawText({ buffer: fileBuffer })
    
    return {
      text: result.value,
      wordCount: result.value.split(/\s+/).length,
      format: 'doc',
      extractionDate: new Date().toISOString(),
      success: true
    }
  } catch (error) {
    return {
      text: '',
      wordCount: 0,
      format: 'doc',
      extractionDate: new Date().toISOString(),
      success: false,
      error: error instanceof Error ? error.message : 'DOC parsing failed'
    }
  }
}

/**
 * Clean and normalize extracted text
 */
function cleanText(text: string): string {
  if (!text) return ''
  
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters that might interfere with AI processing
    .replace(/[^\w\s\-.,!?;:()@#$%&*+=\[\]{}|\\/"'<>]/g, '')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove multiple consecutive line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Trim whitespace
    .trim()
}

/**
 * Main function to extract text from resume files
 */
export async function extractResumeText(
  fileBuffer: Buffer, 
  fileName: string
): Promise<ResumeParseResult> {
  try {
    const fileExtension = fileName.toLowerCase().split('.').pop()
    let parsedResume: ParsedResume

    switch (fileExtension) {
      case 'pdf':
        parsedResume = await extractTextFromPDF(fileBuffer)
        break
      case 'docx':
        parsedResume = await extractTextFromDOCX(fileBuffer)
        break
      case 'doc':
        parsedResume = await extractTextFromDOC(fileBuffer)
        break
      default:
        return {
          success: false,
          error: `Unsupported file format: ${fileExtension}`
        }
    }

    if (!parsedResume.success) {
      return {
        success: false,
        error: parsedResume.error || 'Text extraction failed'
      }
    }

    // Clean the extracted text
    const cleanedText = cleanText(parsedResume.text)
    
    // Validate that we got meaningful content
    if (cleanedText.length < 50) {
      return {
        success: false,
        error: 'Extracted text is too short to be a valid resume'
      }
    }

    const finalResult: ParsedResume = {
      ...parsedResume,
      text: cleanedText,
      wordCount: cleanedText.split(/\s+/).length
    }

    return {
      success: true,
      data: finalResult
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Resume parsing failed'
    }
  }
}

/**
 * Validate if the extracted text looks like a resume
 */
export function validateResumeContent(text: string): {
  isValid: boolean
  confidence: number
  reasons: string[]
} {
  const reasons: string[] = []
  let confidence = 0

  // Check for common resume sections
  const resumeKeywords = [
    'experience', 'education', 'skills', 'work', 'employment',
    'job', 'position', 'company', 'university', 'degree',
    'certification', 'project', 'achievement', 'responsibility'
  ]

  const lowerText = text.toLowerCase()
  const foundKeywords = resumeKeywords.filter(keyword => 
    lowerText.includes(keyword)
  )

  if (foundKeywords.length >= 3) {
    confidence += 30
    reasons.push(`Found ${foundKeywords.length} resume-related keywords`)
  }

  // Check for email patterns
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
  if (emailRegex.test(text)) {
    confidence += 20
    reasons.push('Contains email address')
  }

  // Check for phone number patterns
  const phoneRegex = /(\+\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/
  if (phoneRegex.test(text)) {
    confidence += 15
    reasons.push('Contains phone number')
  }

  // Check for date patterns (years)
  const yearRegex = /(19|20)\d{2}/
  if (yearRegex.test(text)) {
    confidence += 10
    reasons.push('Contains year dates')
  }

  // Check for reasonable length
  if (text.length >= 200 && text.length <= 10000) {
    confidence += 15
    reasons.push('Reasonable text length')
  } else if (text.length < 200) {
    confidence -= 20
    reasons.push('Text too short')
  } else if (text.length > 10000) {
    confidence -= 10
    reasons.push('Text unusually long')
  }

  // Check for bullet points or structured content
  if (text.includes('•') || text.includes('-') || text.includes('*')) {
    confidence += 10
    reasons.push('Contains bullet points')
  }

  const isValid = confidence >= 50

  return {
    isValid,
    confidence: Math.min(100, Math.max(0, confidence)),
    reasons
  }
}

/**
 * Get file metadata for logging
 */
export function getFileMetadata(fileBuffer: Buffer, fileName: string) {
  return {
    fileName,
    fileSize: fileBuffer.length,
    fileExtension: fileName.toLowerCase().split('.').pop(),
    uploadDate: new Date().toISOString()
  }
}
