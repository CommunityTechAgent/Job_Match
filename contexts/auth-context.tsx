"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { createSupabaseClient, getProfile, type Profile } from "@/lib/supabase"
import type { User, Session } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const initialize = useCallback(async () => {
    try {
      console.log("Initializing auth context...")
      const supabase = createSupabaseClient()

      if (!supabase) {
        console.error("Supabase client not available")
        setLoading(false)
        return
      }

      // Get initial session
      const {
        data: { session: initialSession },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Error getting session:", sessionError)
      } else if (initialSession) {
        console.log("Initial session found:", initialSession.user.email)
        setSession(initialSession)
        setUser(initialSession.user)

        // Load user profile
        const { data: profileData, error: profileError } = await getProfile(initialSession.user.id)
        if (profileError) {
          console.error("Error loading profile:", profileError)
        } else if (profileData) {
          console.log("Profile loaded:", profileData.full_name)
          setProfile(profileData)
        }
      } else {
        console.log("No initial session found")
      }

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.email)

        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user) {
          // Load user profile when session changes
          const { data: profileData, error: profileError } = await getProfile(newSession.user.id)
          if (profileError) {
            console.error("Error loading profile after auth change:", profileError)
          } else if (profileData) {
            console.log("Profile loaded after auth change:", profileData.full_name)
            setProfile(profileData)
          }
        } else {
          setProfile(null)
        }
      })

      // Cleanup function will be handled by the component unmount
      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error("Error initializing auth:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      const supabase = createSupabaseClient()
      if (supabase) {
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        setProfile(null)
      }
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }, [])

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    setUser,
    setSession,
    setProfile,
    setLoading,
    initialize,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
