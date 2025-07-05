"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, lazy, Suspense } from "react"
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
  clearInvalidTokens: () => Promise<void>
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

  const clearInvalidTokens = async () => {
    console.log("Clearing invalid tokens...");
    const client = createSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
        // Clear any stored tokens from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('sb-bqvpxjjtrtjqnrswfuai-auth-token');
        }
      } catch (error) {
        console.error("Error clearing tokens:", error);
      }
    }
    setProfile(null);
    setSession(null);
    setUser(null);
  }

  const signUp = async (email: string, password:string, fullName: string) => {
    console.log("Attempting sign up for:", email);
    const client = createSupabaseClient();
    if (!client) {
      console.error("Supabase client not initialized");
      return { error: "Supabase client not initialized" };
    }
    
    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      
      if (error) {
        console.error("Sign up error:", error);
        return { error };
      }
      
      console.log("Sign up successful:", data.user?.email);
      
      if (data.user) {
        const { error: profileError } = await createProfile(data.user.id, email, fullName);
        if (profileError) {
          console.error("Error creating profile:", profileError);
          // Don't return error here as user was created successfully
        } else {
          console.log("Profile created successfully");
        }
      }
      return { error: null };
    } catch (error) {
      console.error("Unexpected error in signUp:", error);
      return { error };
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log("Attempting sign in for:", email);
    const client = createSupabaseClient();
    if (!client) {
      console.error("Supabase client not initialized");
      return { error: "Supabase client not initialized" };
    }
    
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("Sign in error:", error);
        return { error };
      }
      
      console.log("Sign in successful:", data.user?.email);
      return { error: null };
    } catch (error) {
      console.error("Unexpected error in signIn:", error);
      return { error };
    }
  }

  const signOut = async () => {
    console.log("Attempting sign out");
    const client = createSupabaseClient();
    if (!client) {
      console.error("Supabase client not initialized");
      return;
    }
    
    try {
      await client.auth.signOut();
      // Clear any stored tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-bqvpxjjtrtjqnrswfuai-auth-token');
      }
      setProfile(null);
      setSession(null);
      console.log("Sign out successful");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: "No user logged in" };
    
    try {
      const { data, error } = await updateProfileDb(user.id, updates);
      if (!error && data) {
        setProfile(data as Profile);
        console.log("Profile updated successfully");
      } else if (error) {
        console.error("Error updating profile:", error);
      }
      return { error };
    } catch (error) {
      console.error("Unexpected error in updateProfile:", error);
      return { error };
    }
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
    clearInvalidTokens,
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
