"use client"

import { useAuth } from "@/contexts/auth-context"
import { createSupabaseClient, getProfile, Profile } from "@/lib/supabase"
import { useEffect } from "react"

export function useSessionLoader() {
  const { user, setSession, setProfile, setLoading } = useAuth()
  
  useEffect(() => {
    const client = createSupabaseClient();
    if (!client) {
      console.error("Supabase client not initialized");
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    const loadSession = async () => {
      try {
        const { data: { session }, error } = await client.auth.getSession();
        
        if (error) {
          console.error("Error loading session:", error);
          
          // Handle refresh token errors by clearing invalid tokens
          if (error.message.includes("Invalid Refresh Token") || 
              error.message.includes("Refresh Token Not Found")) {
            console.log("Clearing invalid refresh token...");
            await client.auth.signOut();
            if (isSubscribed) {
              setSession(null);
              setProfile(null);
              setLoading(false);
            }
            return;
          }
        }
        
        if (isSubscribed) {
          setSession(session);
          if (!session) {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error in loadSession:", error);
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    loadSession();

    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (isSubscribed) {
          setSession(session);
          if (event === 'SIGNED_OUT' || !session) {
            setProfile(null);
            setLoading(false);
          } else if (event === 'SIGNED_IN' && session?.user) {
            // Load profile when user signs in
            try {
              const { data: profile, error } = await getProfile(session.user.id);
              if (error) {
                console.error("Error loading profile:", error);
              }
              setProfile(profile as Profile | null);
            } catch (error) {
              console.error("Error in profile loading:", error);
            } finally {
              setLoading(false);
            }
          } else if (event === 'TOKEN_REFRESHED') {
            console.log("Token refreshed successfully");
          }
        }
      }
    )

    return () => {
      isSubscribed = false;
      subscription?.unsubscribe()
    }
  }, [setSession, setProfile, setLoading])

  useEffect(() => {
    if (user) {
      getProfile(user.id)
        .then(({ data: profile, error }) => {
          if (error) {
            console.error("Error loading profile:", error);
          }
          setProfile(profile as Profile | null);
        })
        .catch((error) => {
          console.error("Error in profile loading:", error);
        })
        .finally(() => setLoading(false));
    }
  }, [user, setProfile, setLoading]);
}
