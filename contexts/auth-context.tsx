"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase, type Profile, createProfile, getProfile, updateProfile as updateProfileDb, createSupabaseClient } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  // We still provide the functions for components to call
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // When session changes, update user
    setUser(session?.user ?? null)
  }, [session])

  const signUp = async (email: string, password:string, fullName: string) => {
    const client = createSupabaseClient();
    if (!client) return { error: "Supabase client not initialized" };
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error };
    if (data.user) {
      const { error: profileError } = await createProfile(data.user.id, email, fullName);
      if (profileError) console.error("Error creating profile:", profileError);
    }
    return { error: null };
  }

  const signIn = async (email: string, password: string) => {
    const client = createSupabaseClient();
    if (!client) return { error: "Supabase client not initialized" };
    const { error } = await client.auth.signInWithPassword({ email, password });
    return { error };
  }

  const signOut = async () => {
    const client = createSupabaseClient();
    if (!client) return;
    await client.auth.signOut();
    setProfile(null);
    setSession(null);
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: "No user logged in" };
    const { data, error } = await updateProfileDb(user.id, updates);
    if (!error && data) {
      setProfile(data as Profile);
    }
    return { error };
  }

  const value = {
    user,
    profile,
    session,
    loading,
    setSession,
    setProfile,
    setLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
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
