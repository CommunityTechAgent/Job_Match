"use client"

import { useSessionLoader } from "@/hooks/use-session-loader"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export function SessionLoader({ children }: { children: React.ReactNode }) {
  useSessionLoader()
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
