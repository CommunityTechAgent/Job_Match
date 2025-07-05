"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function ClearTokensPage() {
  const [cleared, setCleared] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearTokens = () => {
    try {
      // Clear all possible Supabase token storage locations
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
        localStorage.removeItem('sb-bqvpxjjtrtjqnrswfuai-auth-token')
        localStorage.removeItem('supabase.auth.expires_at')
        localStorage.removeItem('supabase.auth.refresh_token')
        
        // Clear sessionStorage as well
        sessionStorage.removeItem('supabase.auth.token')
        sessionStorage.removeItem('sb-bqvpxjjtrtjqnrswfuai-auth-token')
        
        // Clear any cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        setCleared(true)
        setError(null)
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {cleared ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-orange-500" />}
            Clear Authentication Tokens
          </CardTitle>
          <CardDescription>
            This will clear all stored authentication tokens and redirect you to the home page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">Error: {error}</p>
            </div>
          )}
          
          {cleared ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✅ Tokens cleared successfully! Redirecting to home page...
              </p>
            </div>
          ) : (
            <Button onClick={clearTokens} className="w-full" variant="destructive">
              Clear All Tokens
            </Button>
          )}
          
          <div className="text-sm text-gray-600">
            <p><strong>What this does:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Clears localStorage authentication tokens</li>
              <li>Clears sessionStorage authentication tokens</li>
              <li>Clears authentication cookies</li>
              <li>Redirects to home page</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 