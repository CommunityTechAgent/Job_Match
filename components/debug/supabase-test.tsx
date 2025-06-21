"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function SupabaseTest() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<{
    connection: boolean | null
    tables: boolean | null
    auth: boolean | null
    error?: string
  }>({
    connection: null,
    tables: null,
    auth: null,
  })

  const runTests = async () => {
    setTesting(true)
    const newResults = { connection: false, tables: false, auth: false, error: "" }

    try {
      // Test 1: Basic connection
      const { data, error } = await supabase.from("profiles").select("count", { count: "exact", head: true })

      if (error) {
        newResults.error = error.message
        if (error.message.includes("relation") || error.message.includes("does not exist")) {
          newResults.connection = true // Connection works, but table doesn't exist
          newResults.tables = false
        } else {
          newResults.connection = false
        }
      } else {
        newResults.connection = true
        newResults.tables = true
      }

      // Test 2: Auth service
      try {
        const { data: authData, error: authError } = await supabase.auth.getSession()
        newResults.auth = !authError
      } catch (authErr) {
        newResults.auth = false
      }
    } catch (err: any) {
      newResults.error = err.message
      newResults.connection = false
    }

    setResults(newResults)
    setTesting(false)
  }

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <div className="w-5 h-5 bg-gray-300 rounded-full" />
    return status ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>Test your Supabase configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={testing} className="w-full">
          {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Run Connection Test
        </Button>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Database Connection</span>
            <StatusIcon status={results.connection} />
          </div>
          <div className="flex items-center justify-between">
            <span>Tables Exist</span>
            <StatusIcon status={results.tables} />
          </div>
          <div className="flex items-center justify-between">
            <span>Auth Service</span>
            <StatusIcon status={results.auth} />
          </div>
        </div>

        {results.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">Error: {results.error}</p>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>
            <strong>Environment Variables:</strong>
          </p>
          <p>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing"}</p>
          <p>SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing"}</p>
        </div>
      </CardContent>
    </Card>
  )
}
