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
  created_at: string
  updated_at: string
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
