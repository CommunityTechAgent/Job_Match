import { supabase } from './supabase'
import type { Profile } from './supabase'

export interface JobMatch {
  id: string
  title: string
  company: string
  location: string
  description: string
  requirements: string
  salary_range: string
  job_type: string
  experience_level: string
  remote_friendly: boolean
  posted_date: string
  airtable_id: string
  data_source: string
  sync_status: string
  last_sync_date: string
  created_at: string
  updated_at: string
  // Matching fields
  match_score: number
  match_reasons: string[]
  matching_skills: string[]
  skills_overlap_percentage: number
}

export interface MatchResult {
  matches: JobMatch[]
  totalJobs: number
  userProfile: Partial<Profile>
  matchStats: {
    averageScore: number
    highMatches: number // 80%+
    mediumMatches: number // 50-79%
    lowMatches: number // <50%
  }
}

export interface MatchFilters {
  minScore?: number
  location?: string
  jobType?: string
  experienceLevel?: string
  remoteOnly?: boolean
  limit?: number
  search?: string
}

/**
 * Get user profile data for matching
 */
export async function getUserProfileForMatching(userId: string): Promise<Partial<Profile>> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      id,
      user_id,
      full_name,
      location,
      job_title,
      experience_level,
      experience_years,
      skills,
      preferred_job_types,
      preferred_locations,
      preferred_salary_range,
      remote_preference,
      availability_status
    `)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile for matching:', error)
    throw new Error(`Failed to fetch user profile: ${error.message}`)
  }

  return profile || {}
}

/**
 * Get active jobs for matching
 */
export async function getActiveJobsForMatching(filters?: MatchFilters): Promise<any[]> {
  let query = supabase
    .from('jobs')
    .select('*')
    .eq('status', 'Active')
    .eq('sync_status', 'synced')
    .order('posted_date', { ascending: false })

  // Apply filters
  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }

  if (filters?.jobType) {
    query = query.eq('job_type', filters.jobType)
  }

  if (filters?.experienceLevel) {
    query = query.eq('experience_level', filters.experienceLevel)
  }

  if (filters?.remoteOnly) {
    query = query.eq('remote_friendly', true)
  }

  // Apply search filter - search across multiple fields
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    query = query.or(
      `title.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,requirements.ilike.%${searchTerm}%`
    )
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data: jobs, error } = await query

  if (error) {
    console.error('Error fetching jobs for matching:', error)
    throw new Error(`Failed to fetch jobs: ${error.message}`)
  }

  return jobs || []
}

/**
 * Calculate skills overlap between user and job
 */
function calculateSkillsOverlap(userSkills: string[], jobSkills: string[]): {
  matchingSkills: string[]
  overlapPercentage: number
  score: number
} {
  if (!userSkills?.length || !jobSkills?.length) {
    return {
      matchingSkills: [],
      overlapPercentage: 0,
      score: 0
    }
  }

  const userSkillsSet = new Set(userSkills.map(s => s.toLowerCase().trim()))
  const jobSkillsSet = new Set(jobSkills.map(s => s.toLowerCase().trim()))

  const matchingSkills: string[] = []
  jobSkillsSet.forEach(skill => {
    if (userSkillsSet.has(skill)) {
      matchingSkills.push(skill)
    }
  })

  const overlapPercentage = (matchingSkills.length / jobSkillsSet.size) * 100
  const score = Math.min(50, overlapPercentage * 0.5) // Max 50 points for skills

  return {
    matchingSkills,
    overlapPercentage,
    score
  }
}

/**
 * Calculate location match score
 */
function calculateLocationMatch(userLocation: string, jobLocation: string): {
  score: number
  reason: string | null
} {
  if (!userLocation || !jobLocation) {
    return { score: 0, reason: null }
  }

  const userLoc = userLocation.toLowerCase().trim()
  const jobLoc = jobLocation.toLowerCase().trim()

  // Exact match
  if (userLoc === jobLoc) {
    return { score: 25, reason: `Exact location match: ${jobLocation}` }
  }

  // Contains match
  if (jobLoc.includes(userLoc) || userLoc.includes(jobLoc)) {
    return { score: 20, reason: `Location overlap: ${jobLocation}` }
  }

  // Remote-friendly bonus
  if (jobLocation.toLowerCase().includes('remote') || jobLocation.toLowerCase().includes('anywhere')) {
    return { score: 15, reason: 'Remote-friendly position' }
  }

  return { score: 0, reason: null }
}

/**
 * Calculate experience level match
 */
function calculateExperienceMatch(userLevel: string, jobLevel: string): {
  score: number
  reason: string | null
} {
  if (!userLevel || !jobLevel) {
    return { score: 0, reason: null }
  }

  const levelHierarchy = {
    'entry': 1,
    'mid': 2,
    'senior': 3,
    'lead': 4,
    'executive': 5
  }

  const userLevelNum = levelHierarchy[userLevel as keyof typeof levelHierarchy] || 0
  const jobLevelNum = levelHierarchy[jobLevel as keyof typeof levelHierarchy] || 0

  if (userLevelNum === jobLevelNum) {
    return { score: 15, reason: `Experience level match: ${jobLevel}` }
  }

  // User has more experience than required (good)
  if (userLevelNum > jobLevelNum) {
    return { score: 10, reason: `Overqualified for ${jobLevel} position` }
  }

  // User has less experience than required (acceptable for some cases)
  if (userLevelNum === jobLevelNum - 1) {
    return { score: 5, reason: `Slightly underqualified for ${jobLevel} position` }
  }

  return { score: 0, reason: null }
}

/**
 * Calculate additional bonus factors
 */
function calculateBonusFactors(job: any, userProfile: Partial<Profile>): {
  score: number
  reasons: string[]
} {
  let score = 0
  const reasons: string[] = []

  // Remote preference match
  if (job.remote_friendly && userProfile.remote_preference === 'Remote') {
    score += 10
    reasons.push('Remote preference match')
  }

  // Recent job bonus
  const daysSincePosted = Math.floor((new Date().getTime() - new Date(job.posted_date).getTime()) / (1000 * 60 * 60 * 24))
  if (daysSincePosted < 7) {
    score += 5
    reasons.push('Recently posted (within 7 days)')
  } else if (daysSincePosted < 30) {
    score += 3
    reasons.push('Posted within 30 days')
  }

  // Salary range preference match
  if (userProfile.preferred_salary_range && job.salary_range) {
    // Simple salary range matching (could be enhanced)
    const userMin = userProfile.preferred_salary_range.min
    const userMax = userProfile.preferred_salary_range.max
    
    // Extract salary from job (simplified)
    const salaryMatch = job.salary_range.toLowerCase().includes('competitive') || 
                       job.salary_range.toLowerCase().includes('market')
    
    if (salaryMatch) {
      score += 5
      reasons.push('Competitive salary range')
    }
  }

  // Job type preference match
  if (userProfile.preferred_job_types?.length && job.job_type) {
    const userJobTypes = userProfile.preferred_job_types.map(t => t.toLowerCase())
    if (userJobTypes.includes(job.job_type.toLowerCase())) {
      score += 8
      reasons.push(`Preferred job type: ${job.job_type}`)
    }
  }

  return { score, reasons }
}

/**
 * Main matching algorithm
 */
export async function findJobMatches(
  userId: string, 
  filters?: MatchFilters
): Promise<MatchResult> {
  try {
    // Get user profile
    const userProfile = await getUserProfileForMatching(userId)
    
    // Get active jobs
    const jobs = await getActiveJobsForMatching(filters)
    
    // Calculate match scores for each job
    const scoredJobs: JobMatch[] = jobs.map(job => {
      let totalScore = 0
      const matchReasons: string[] = []
      const matchingSkills: string[] = []

      // Skills matching (highest weight)
      if (userProfile.skills?.length) {
        const jobSkills = job.skills_required || job.requirements?.split(',').map((s: string) => s.trim()) || []
        const skillsMatch = calculateSkillsOverlap(userProfile.skills, jobSkills)
        
        totalScore += skillsMatch.score
        matchingSkills.push(...skillsMatch.matchingSkills)
        
        if (skillsMatch.matchingSkills.length > 0) {
          matchReasons.push(`Matched ${skillsMatch.matchingSkills.length} skills: ${skillsMatch.matchingSkills.join(', ')}`)
        }
      }

      // Location matching
      if (userProfile.location && job.location) {
        const locationMatch = calculateLocationMatch(userProfile.location, job.location)
        totalScore += locationMatch.score
        if (locationMatch.reason) {
          matchReasons.push(locationMatch.reason)
        }
      }

      // Experience level matching
      if (userProfile.experience_level && job.experience_level) {
        const experienceMatch = calculateExperienceMatch(userProfile.experience_level, job.experience_level)
        totalScore += experienceMatch.score
        if (experienceMatch.reason) {
          matchReasons.push(experienceMatch.reason)
        }
      }

      // Bonus factors
      const bonusFactors = calculateBonusFactors(job, userProfile)
      totalScore += bonusFactors.score
      matchReasons.push(...bonusFactors.reasons)

      // Cap score at 100
      const finalScore = Math.min(100, Math.round(totalScore))

      return {
        ...job,
        match_score: finalScore,
        match_reasons: matchReasons,
        matching_skills: matchingSkills,
        skills_overlap_percentage: matchingSkills.length > 0 ? 
          (matchingSkills.length / (job.skills_required?.length || 1)) * 100 : 0
      }
    })

    // Sort by match score (highest first)
    const sortedMatches = scoredJobs.sort((a, b) => b.match_score - a.match_score)

    // Apply minimum score filter
    const filteredMatches = filters?.minScore ? 
      sortedMatches.filter(job => job.match_score >= filters.minScore!) : 
      sortedMatches

    // Calculate match statistics
    const scores = filteredMatches.map(job => job.match_score)
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    
    const matchStats = {
      averageScore: Math.round(averageScore),
      highMatches: filteredMatches.filter(job => job.match_score >= 80).length,
      mediumMatches: filteredMatches.filter(job => job.match_score >= 50 && job.match_score < 80).length,
      lowMatches: filteredMatches.filter(job => job.match_score < 50).length
    }

    return {
      matches: filteredMatches,
      totalJobs: jobs.length,
      userProfile,
      matchStats
    }

  } catch (error) {
    console.error('Error in job matching algorithm:', error)
    throw new Error(`Job matching failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get match recommendations for a user
 */
export async function getMatchRecommendations(userId: string, limit: number = 10): Promise<JobMatch[]> {
  const result = await findJobMatches(userId, { limit })
  return result.matches.slice(0, limit)
}

/**
 * Get match statistics for a user
 */
export async function getMatchStatistics(userId: string): Promise<{
  totalJobs: number
  averageScore: number
  highMatches: number
  mediumMatches: number
  lowMatches: number
  topSkills: string[]
}> {
  const result = await findJobMatches(userId)
  
  // Get top skills from high-scoring matches
  const highMatches = result.matches.filter(job => job.match_score >= 80)
  const topSkills = highMatches
    .flatMap(job => job.matching_skills)
    .reduce((acc: { [key: string]: number }, skill: string) => {
      acc[skill] = (acc[skill] || 0) + 1
      return acc
    }, {})
  
  const sortedTopSkills = Object.entries(topSkills)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([skill]) => skill)

  return {
    totalJobs: result.totalJobs,
    averageScore: result.matchStats.averageScore,
    highMatches: result.matchStats.highMatches,
    mediumMatches: result.matchStats.mediumMatches,
    lowMatches: result.matchStats.lowMatches,
    topSkills: sortedTopSkills
  }
} 