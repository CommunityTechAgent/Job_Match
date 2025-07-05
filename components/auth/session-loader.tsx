"use client"

import type React from "react"
import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

interface SessionLoaderProps {
  children: React.ReactNode
}

export function SessionLoader({ children }: SessionLoaderProps) {
  const { initialize, loading } = useAuth()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
