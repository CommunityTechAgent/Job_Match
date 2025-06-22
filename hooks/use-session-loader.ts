"use client"

import { useAuth } from "@/contexts/auth-context"
import { createSupabaseClient, getProfile, Profile } from "@/lib/supabase"
import { useEffect } from "react"

export function useSessionLoader() {
  const { user, setSession, setProfile, setLoading } = useAuth()
  
  useEffect(() => {
    const client = createSupabaseClient();
    if (!client) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    const loadSession = async () => {
      const { data: { session } } = await client.auth.getSession();
      if (isSubscribed) {
        setSession(session);
        if (!session) {
          setLoading(false);
        }
      }
    };

    loadSession();

    const { data: { subscription } } = client.auth.onAuthStateChange(
      (event, session) => {
        if (isSubscribed) {
          setSession(session);
          if (event === 'SIGNED_OUT' || !session) {
            setProfile(null);
            setLoading(false);
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
        .then(({ data: profile }) => setProfile(profile as Profile | null))
        .finally(() => setLoading(false));
    }
  }, [user, setProfile, setLoading]);
} 