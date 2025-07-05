"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AuthDebug() {
  const { user, profile, session, loading, signOut, clearInvalidTokens } = useAuth()

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
        <CardDescription>Current authentication state</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Loading:</span>
            <Badge variant={loading ? "destructive" : "default"}>
              {loading ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Authenticated:</span>
            <Badge variant={user ? "default" : "secondary"}>
              {user ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Session:</span>
            <Badge variant={session ? "default" : "secondary"}>
              {session ? "Active" : "None"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Profile:</span>
            <Badge variant={profile ? "default" : "secondary"}>
              {profile ? "Loaded" : "None"}
            </Badge>
          </div>
        </div>

        {user && (
          <div className="space-y-2">
            <h4 className="font-medium">User Info:</h4>
            <div className="text-sm space-y-1">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email Verified:</strong> {user.email_confirmed_at ? "Yes" : "No"}</p>
            </div>
          </div>
        )}

        {profile && (
          <div className="space-y-2">
            <h4 className="font-medium">Profile Info:</h4>
            <div className="text-sm space-y-1">
              <p><strong>Name:</strong> {profile.full_name || "Not set"}</p>
              <p><strong>Location:</strong> {profile.location || "Not set"}</p>
              <p><strong>Job Title:</strong> {profile.job_title || "Not set"}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Button onClick={clearInvalidTokens} variant="outline" className="w-full">
            Clear Invalid Tokens
          </Button>
          {user && (
            <Button onClick={signOut} variant="outline" className="w-full">
              Sign Out
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 