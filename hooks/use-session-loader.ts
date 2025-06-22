"use client"

import { useAuth } from "@/contexts/auth-context"
import { createSupabaseClient, getProfile, Profile } from "@/lib/supabase"
import { useEffect } from "react"

export function useSessionLoader() {
  const { setSession, setProfile, setLoading } = useAuth()
  
  useEffect(() => {
    const client = createSupabaseClient();
    if (!client) return;

    // Get initial session
    client.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const { data: profile } = await getProfile(session.user.id)
        setProfile(profile as Profile | null)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session?.user) {
          const { data: profile } = await getProfile(session.user.id)
          setProfile(profile as Profile | null)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [setSession, setProfile, setLoading])
} 