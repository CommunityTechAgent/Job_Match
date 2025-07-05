import { AirtableJobRecord, SupabaseJob } from './airtable'

// Transform Airtable record to Supabase format
export function transformAirtableJob(airtableRecord: AirtableJobRecord): SupabaseJob {
  const fields = airtableRecord.fields
  
  // Parse skills from string to array
  const skillsRequired = fields['Skills Required'] 
    ? fields['Skills Required'].split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
    : []

  // Parse dates
  const postedDate = fields['Posted Date'] ? new Date(fields['Posted Date']).toISOString().split('T')[0] : undefined
  const expiresDate = fields['Expires Date'] ? new Date(fields['Expires Date']).toISOString().split('T')[0] : undefined

  // Validate and sanitize data
  const job: SupabaseJob = {
    airtable_id: airtableRecord.id,
    title: sanitizeText(fields['Title']) || '',
    company: sanitizeText(fields['Company']) || '',
    location: sanitizeText(fields['Location']) || '',
    job_type: validateJobType(fields['Job Type']),
    experience_level: validateExperienceLevel(fields['Experience Level']),
    salary_min: validateSalary(fields['Salary Min']),
    salary_max: validateSalary(fields['Salary Max']),
    description: sanitizeText(fields['Description']),
    requirements: sanitizeText(fields['Requirements']),
    status: validateStatus(fields['Status'] || 'Active'),
    posted_date: postedDate,
    expires_date: expiresDate,
    created_by: sanitizeText(fields['Created By']),
    industry: sanitizeText(fields['Industry']),
    department: sanitizeText(fields['Department']),
    remote_friendly: Boolean(fields['Remote Friendly']),
    skills_required: skillsRequired,
    priority: validatePriority(fields['Priority']),
    last_sync_date: new Date().toISOString(),
    sync_status: 'synced',
    data_source: 'airtable'
  }

  return job
}

// Data validation and sanitization functions
function sanitizeText(text?: string): string {
  if (!text) return ''
  return text.trim().replace(/\s+/g, ' ')
}

function validateJobType(jobType?: string): string | undefined {
  const validTypes = ['Full-time', 'Part-time', 'Contract', 'Remote']
  return validTypes.includes(jobType || '') ? jobType : undefined
}

function validateExperienceLevel(level?: string): string | undefined {
  const validLevels = ['Entry', 'Mid', 'Senior', 'Executive']
  return validLevels.includes(level || '') ? level : undefined
}

function validateSalary(salary?: number): number | undefined {
  if (!salary || salary < 0) return undefined
  return Math.round(salary * 100) / 100 // Round to 2 decimal places
}

function validateStatus(status?: string): string {
  const validStatuses = ['Draft', 'Active', 'Paused', 'Expired', 'Filled']
  return validStatuses.includes(status || '') ? status! : 'Active'
}

function validatePriority(priority?: string): string | undefined {
  const validPriorities = ['High', 'Medium', 'Low']
  return validPriorities.includes(priority || '') ? priority : undefined
}

// Validate required fields
export function validateRequiredFields(job: SupabaseJob): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!job.title || job.title.trim().length === 0) {
    errors.push('Title is required')
  }

  if (!job.company || job.company.trim().length === 0) {
    errors.push('Company is required')
  }

  if (!job.location || job.location.trim().length === 0) {
    errors.push('Location is required')
  }

  // Validate salary range
  if (job.salary_min && job.salary_max && job.salary_min > job.salary_max) {
    errors.push('Salary minimum cannot be greater than salary maximum')
  }

  // Validate dates
  if (job.posted_date && job.expires_date) {
    const posted = new Date(job.posted_date)
    const expires = new Date(job.expires_date)
    if (posted > expires) {
      errors.push('Posted date cannot be after expires date')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Transform multiple Airtable records
export function transformAirtableJobs(airtableRecords: AirtableJobRecord[]): SupabaseJob[] {
  return airtableRecords.map(record => transformAirtableJob(record))
}

// Compare two jobs to check if they're different
export function jobsAreDifferent(job1: SupabaseJob, job2: SupabaseJob): boolean {
  const fieldsToCompare = [
    'title', 'company', 'location', 'job_type', 'experience_level',
    'salary_min', 'salary_max', 'description', 'requirements', 'status',
    'posted_date', 'expires_date', 'industry', 'department', 'remote_friendly',
    'priority'
  ]

  for (const field of fieldsToCompare) {
    if (job1[field as keyof SupabaseJob] !== job2[field as keyof SupabaseJob]) {
      return true
    }
  }

  // Compare skills arrays
  const skills1 = job1.skills_required?.sort() || []
  const skills2 = job2.skills_required?.sort() || []
  
  if (skills1.length !== skills2.length) return true
  
  for (let i = 0; i < skills1.length; i++) {
    if (skills1[i] !== skills2[i]) return true
  }

  return false
}
