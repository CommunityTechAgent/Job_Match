// AI Prompts for resume analysis and skill extraction

export const RESUME_ANALYSIS_PROMPTS = {
  // Main skills extraction prompt
  skillsExtraction: {
    system: `You are an expert at analyzing resumes and extracting technical skills, job titles, and experience levels. 
    
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

Only include skills that are clearly mentioned in the resume. Be conservative with confidence scores.`,

    user: `Please analyze this resume and extract the information as specified:

{resumeText}

Focus on:
- Technical skills, programming languages, frameworks, tools
- Software and technologies mentioned
- Professional certifications
- Clear job titles and roles
- Experience level indicators

Return only valid JSON.`
  },

  // Job title extraction prompt
  jobTitleExtraction: {
    system: `You are an expert at identifying job titles from resumes. 
    
Extract the most recent or primary job title from the resume. 
Return only the job title as a simple string, nothing else.`,

    user: `What is the most recent job title in this resume?

{resumeText}

Return only the job title, nothing else.`
  },

  // Experience level determination prompt
  experienceLevelDetermination: {
    system: `You are an expert at determining experience levels from resumes.
    
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
}`,

    user: `Analyze this resume and determine the experience level:

{resumeText}

Consider:
- Years of experience
- Job titles and seniority
- Responsibilities and scope
- Team size managed
- Project complexity

Return only valid JSON.`
  },

  // Skills validation prompt
  skillsValidation: {
    system: `You are an expert at validating and normalizing technical skills from resumes.
    
Your task is to:
1. Validate that extracted skills are real technical skills
2. Normalize skill names to standard formats
3. Categorize skills by type (programming language, framework, tool, etc.)
4. Provide alternative names for skills

Return your response as JSON:
{
  "validatedSkills": [
    {
      "original": "JS",
      "normalized": "JavaScript",
      "category": "programming_language",
      "confidence": 95
    }
  ],
  "invalidSkills": ["madeup-skill"],
  "suggestions": {
    "madeup-skill": ["JavaScript", "TypeScript"]
  }
}`,

    user: `Validate and normalize these extracted skills:

{skills}

Return only valid JSON.`
  },

  // Resume content validation prompt
  resumeValidation: {
    system: `You are an expert at validating resume content quality.
    
Analyze the resume text and provide:
1. Content quality score (0-100)
2. Completeness assessment
3. Key missing elements
4. Suggestions for improvement

Return your response as JSON:
{
  "qualityScore": 85,
  "completeness": "good",
  "missingElements": ["phone number", "linkedin profile"],
  "suggestions": ["Add more quantifiable achievements"],
  "isValidResume": true
}`,

    user: `Analyze this resume content for quality and completeness:

{resumeText}

Return only valid JSON.`
  }
}

export const JOB_MATCHING_PROMPTS = {
  // Skills matching analysis
  skillsMatching: {
    system: `You are an expert at analyzing skill matches between job candidates and job requirements.
    
Analyze the overlap between candidate skills and job requirements:
1. Calculate skills match percentage
2. Identify key matching skills
3. Highlight missing critical skills
4. Provide match reasoning

Return your response as JSON:
{
  "matchPercentage": 75,
  "matchingSkills": ["JavaScript", "React"],
  "missingSkills": ["TypeScript"],
  "reasoning": "Strong frontend skills match, missing TypeScript experience",
  "overallScore": 75
}`,

    user: `Analyze the skills match between this candidate and job:

Candidate Skills: {candidateSkills}
Job Requirements: {jobRequirements}

Return only valid JSON.`
  },

  // Experience level matching
  experienceMatching: {
    system: `You are an expert at matching experience levels between candidates and job requirements.
    
Analyze if the candidate's experience level is appropriate for the job:
1. Compare experience levels
2. Assess if candidate is over/under qualified
3. Provide reasoning for the match

Return your response as JSON:
{
  "candidateLevel": "mid",
  "jobLevel": "senior",
  "match": "under_qualified",
  "reasoning": "Candidate has mid-level experience but job requires senior level",
  "score": 60
}`,

    user: `Compare experience levels:

Candidate Level: {candidateLevel}
Job Level: {jobLevel}

Return only valid JSON.`
  }
}

export const COVER_LETTER_PROMPTS = {
  // Cover letter generation
  coverLetterGeneration: {
    system: `You are an expert at writing personalized cover letters for job applications.
    
Write a compelling cover letter that:
1. Addresses the specific job requirements
2. Highlights relevant experience and skills
3. Shows enthusiasm for the company/role
4. Is professional and well-structured
5. Is 200-300 words long

Use the candidate's background and the job details to create a personalized letter.`,

    user: `Write a cover letter for this job application:

Job Title: {jobTitle}
Company: {company}
Job Description: {jobDescription}
Candidate Background: {candidateBackground}
Candidate Skills: {candidateSkills}

Write a professional cover letter.`
  }
}

// Helper function to replace placeholders in prompts
export function formatPrompt(template: string, replacements: Record<string, string>): string {
  let formatted = template
  for (const [key, value] of Object.entries(replacements)) {
    formatted = formatted.replace(new RegExp(`{${key}}`, 'g'), value)
  }
  return formatted
}

// Get prompt by category and type
export function getPrompt(category: keyof typeof RESUME_ANALYSIS_PROMPTS | keyof typeof JOB_MATCHING_PROMPTS | keyof typeof COVER_LETTER_PROMPTS, type: 'system' | 'user'): string {
  const prompts = {
    ...RESUME_ANALYSIS_PROMPTS,
    ...JOB_MATCHING_PROMPTS,
    ...COVER_LETTER_PROMPTS
  }
  
  const categoryPrompts = prompts[category as keyof typeof prompts]
  if (!categoryPrompts) {
    throw new Error(`Unknown prompt category: ${category}`)
  }
  
  return categoryPrompts[type]
}
