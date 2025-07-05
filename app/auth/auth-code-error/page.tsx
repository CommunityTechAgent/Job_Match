"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function AuthCodeErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const errorDescription = searchParams.get("error_description")
    const errorCode = searchParams.get("error")

    if (errorDescription) {
      setError(errorDescription)
    } else if (errorCode) {
      setError(`Authentication error: ${errorCode}`)
    } else {
      setError("An unknown authentication error occurred")
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Authentication Error</CardTitle>
          <CardDescription className="text-gray-600">There was a problem with your authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <div className="space-y-2">
            <Button onClick={() => router.push("/")} className="w-full">
              Return to Home
            </Button>
            <Button onClick={() => router.push("/auth/signin")} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
