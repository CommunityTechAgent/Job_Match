import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Add error handling for missing environment variables
if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables")
}

if (!supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export type Profile = {
  id: string
  user_id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  location: string | null
  job_title: string | null
  experience_level: string | null
  skills: string[] | null
  resume_url: string | null
  resume_path: string | null
  resume_filename: string | null
  resume_updated_at: string | null
  // Enhanced profile fields
  profile_image_url: string | null
  headline: string | null
  bio: string | null
  experience_years: number | null
  education: EducationEntry[] | null
  preferred_job_types: string[] | null
  preferred_locations: string[] | null
  preferred_salary_range: SalaryRange | null
  website: string | null
  linkedin_url: string | null
  github_url: string | null
  portfolio_url: string | null
  phone: string | null
  date_of_birth: string | null
  availability_status: 'Available' | 'Open to opportunities' | 'Not looking' | 'Employed' | null
  work_authorization: 'US Citizen' | 'Permanent Resident' | 'Work Visa' | 'Student Visa' | 'Other' | null
  remote_preference: 'On-site' | 'Hybrid' | 'Remote' | 'Flexible' | null
  relocation_willingness: 'Willing to relocate' | 'Open to discussion' | 'Not willing to relocate' | null
  created_at: string
  updated_at: string
}

// Supporting types for enhanced profile
export type EducationEntry = {
  institution: string
  degree: string
  field: string
  start_date?: string
  end_date?: string
  description?: string
  gpa?: number
}

export type SalaryRange = {
  min: number
  max: number
  currency?: string
}

export type WorkExperience = {
  company: string
  position: string
  start_date: string
  end_date?: string
  description: string
  location?: string
  achievements?: string[]
}

export type JobMatch = {
  id: string
  user_id: string
  job_title: string
  company_name: string
  location: string
  match_score: number
  job_url: string | null
  cover_letter_generated: boolean
  email_sent: boolean
  response_received: boolean
  created_at: string
}

// Database helper functions
export const createProfile = async (userId: string, email: string, fullName: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        user_id: userId,
        email: email,
        full_name: fullName,
      },
    ])
    .select()
    .single()

  return { data, error }
}

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single()

  return { data, error }
}

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select()
    .single()

  return { data, error }
}
