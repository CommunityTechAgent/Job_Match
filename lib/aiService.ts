import Anthropic from '@anthropic-ai/sdk'

// Initialize Claude client
let anthropicClient: Anthropic | null = null

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    anthropicClient = new Anthropic({ apiKey })
  }
  return anthropicClient
}

// Rate limiting configuration
const RATE_LIMIT = {
  requestsPerMinute: 50,
  requestsPerHour: 1000
}

let requestCount = {
  minute: 0,
  hour: 0,
  lastMinuteReset: Date.now(),
  lastHourReset: Date.now()
}

// Rate limiting function
function checkRateLimit(): boolean {
  const now = Date.now()
  
  // Reset counters if needed
  if (now - requestCount.lastMinuteReset >= 60000) {
    requestCount.minute = 0
    requestCount.lastMinuteReset = now
  }
  
  if (now - requestCount.lastHourReset >= 3600000) {
    requestCount.hour = 0
    requestCount.lastHourReset = now
  }
  
  // Check limits
  if (requestCount.minute >= RATE_LIMIT.requestsPerMinute) {
    return false
  }
  
  if (requestCount.hour >= RATE_LIMIT.requestsPerHour) {
    return false
  }
  
  // Increment counters
  requestCount.minute++
  requestCount.hour++
  
  return true
}

// Wait function for rate limiting
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Make a Claude API request with rate limiting and error handling
 */
async function makeClaudeRequest(
  prompt: string,
  systemPrompt?: string,
  maxTokens: number = 4000
): Promise<string> {
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please try again later.')
  }
  
  try {
    const client = getAnthropicClient()
    
    const response = await client.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: maxTokens,
      system: systemPrompt || 'You are a helpful AI assistant that extracts information from resumes.',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
    
    return response.content[0].type === 'text' ? response.content[0].text : ''
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('rate_limit')) {
        // Wait and retry once for rate limit errors
        await wait(2000)
        return makeClaudeRequest(prompt, systemPrompt, maxTokens)
      }
      throw new Error(`Claude API error: ${error.message}`)
    }
    throw new Error('Unknown error occurred with Claude API')
  }
}

/**
 * Extract skills from resume text using Claude
 */
export async function extractSkillsFromResume(resumeText: string): Promise<{
  skills: string[]
  confidence: { [skill: string]: number }
  jobTitle?: string
  experienceLevel?: string
  error?: string
}> {
  const systemPrompt = `You are an expert at analyzing resumes and extracting technical skills, job titles, and experience levels. 
  
  Your task is to:
  1. Extract all technical skills, programming languages, tools, frameworks, and technologies mentioned
  2. Identify the most recent job title
  3. Determine the experience level (entry, mid, senior, lead, executive)
  4. Provide confidence scores (0-100) for each extracted skill
  
  Return your response as a JSON object with this structure:
  {
    "skills": ["skill1", "skill2", "skill3"],
    "confidence": {
      "skill1": 95,
      "skill2": 80,
      "skill3": 70
    },
    "jobTitle": "Software Engineer",
    "experienceLevel": "mid"
  }
  
  Only include skills that are clearly mentioned in the resume. Be conservative with confidence scores.`

  const prompt = `Please analyze this resume and extract the information as specified:

${resumeText}

Focus on:
- Technical skills, programming languages, frameworks, tools
- Software and technologies mentioned
- Professional certifications
- Clear job titles and roles
- Experience level indicators

Return only valid JSON.`

  try {
    const response = await makeClaudeRequest(prompt, systemPrompt, 2000)
    
    // Try to parse the JSON response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(response)
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Failed to parse AI response as JSON')
      }
    }
    
    return {
      skills: parsedResponse.skills || [],
      confidence: parsedResponse.confidence || {},
      jobTitle: parsedResponse.jobTitle,
      experienceLevel: parsedResponse.experienceLevel
    }
    
  } catch (error) {
    return {
      skills: [],
      confidence: {},
      error: error instanceof Error ? error.message : 'Skills extraction failed'
    }
  }
}

/**
 * Extract job title from resume text
 */
export async function extractJobTitle(resumeText: string): Promise<{
  jobTitle?: string
  confidence: number
  error?: string
}> {
  const systemPrompt = `You are an expert at identifying job titles from resumes. 
  
  Extract the most recent or primary job title from the resume. 
  Return only the job title as a simple string, nothing else.`

  const prompt = `What is the most recent job title in this resume?

${resumeText}

Return only the job title, nothing else.`

  try {
    const response = await makeClaudeRequest(prompt, systemPrompt, 100)
    const jobTitle = response.trim()
    
    return {
      jobTitle: jobTitle || undefined,
      confidence: jobTitle ? 85 : 0
    }
    
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Job title extraction failed'
    }
  }
}

/**
 * Determine experience level from resume text
 */
export async function determineExperienceLevel(resumeText: string): Promise<{
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  confidence: number
  reasoning: string
  error?: string
}> {
  const systemPrompt = `You are an expert at determining experience levels from resumes.
  
  Analyze the resume and determine the experience level:
  - entry: 0-2 years experience, junior roles
  - mid: 3-5 years experience, intermediate roles
  - senior: 6-10 years experience, senior roles
  - lead: 10+ years experience, team lead/management roles
  - executive: C-level, VP, Director roles
  
  Return your response as JSON:
  {
    "experienceLevel": "mid",
    "confidence": 85,
    "reasoning": "Based on 5 years of experience and senior developer role"
  }`

  const prompt = `Analyze this resume and determine the experience level:

${resumeText}

Consider:
- Years of experience
- Job titles and seniority
- Responsibilities and scope
- Team size managed
- Project complexity

Return only valid JSON.`

  try {
    const response = await makeClaudeRequest(prompt, systemPrompt, 500)
    
    let parsedResponse
    try {
      parsedResponse = JSON.parse(response)
    } catch (parseError) {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Failed to parse experience level response')
      }
    }
    
    return {
      experienceLevel: parsedResponse.experienceLevel,
      confidence: parsedResponse.confidence || 0,
      reasoning: parsedResponse.reasoning || ''
    }
    
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Experience level determination failed'
    }
  }
}

/**
 * Validate extracted skills against a standard skills database
 */
export function validateSkills(extractedSkills: string[]): {
  validSkills: string[]
  invalidSkills: string[]
  suggestions: { [invalid: string]: string[] }
} {
  // This would typically use a comprehensive skills database
  // For now, we'll use a basic validation approach
  
  const validSkills: string[] = []
  const invalidSkills: string[] = []
  const suggestions: { [invalid: string]: string[] } = {}
  
  // Basic skills validation (this should be expanded with a real skills database)
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Django', 'Flask',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'AWS', 'Azure', 'Google Cloud',
    'Docker', 'Kubernetes', 'Git', 'GitHub', 'Jenkins', 'Jira', 'Agile',
    'HTML', 'CSS', 'Sass', 'Less', 'Webpack', 'Vite', 'Babel', 'ESLint',
    'Jest', 'Cypress', 'Selenium', 'GraphQL', 'REST', 'API', 'Microservices'
  ]
  
  const skillSet = new Set(commonSkills.map(s => s.toLowerCase()))
  
  extractedSkills.forEach(skill => {
    const normalizedSkill = skill.trim()
    if (skillSet.has(normalizedSkill.toLowerCase())) {
      validSkills.push(normalizedSkill)
    } else {
      invalidSkills.push(normalizedSkill)
      // Find similar skills for suggestions
      const similar = commonSkills.filter(common => 
        common.toLowerCase().includes(normalizedSkill.toLowerCase()) ||
        normalizedSkill.toLowerCase().includes(common.toLowerCase())
      ).slice(0, 3)
      suggestions[normalizedSkill] = similar
    }
  })
  
  return { validSkills, invalidSkills, suggestions }
}

/**
 * Get rate limit status
 */
export function getRateLimitStatus(): {
  minute: number
  hour: number
  minuteLimit: number
  hourLimit: number
} {
  return {
    minute: requestCount.minute,
    hour: requestCount.hour,
    minuteLimit: RATE_LIMIT.requestsPerMinute,
    hourLimit: RATE_LIMIT.requestsPerHour
  }
} 