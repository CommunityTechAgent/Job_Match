import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function createSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>()
  }
  return supabaseClient
}

export async function getProfile(userId: string): Promise<{ data: Profile | null; error: any }> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Unexpected error fetching profile:", error)
    return { data: null, error }
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>,
): Promise<{ data: Profile | null; error: any }> {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

    if (error) {
      console.error("Error updating profile:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Unexpected error updating profile:", error)
    return { data: null, error }
  }
}
