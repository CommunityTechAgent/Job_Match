"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function SchemaTest() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<{
    schema: string | null
    error?: string
  }>({
    schema: null,
  })

  const testSchema = async () => {
    setTesting(true)
    
    try {
      if (!supabase) {
        setResults({ schema: null, error: "Supabase client not initialized" })
        return
      }

      // Test 1: Check if profiles table exists and get its structure
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)

      if (error) {
        setResults({ schema: null, error: error.message })
        return
      }

      // Test 2: Try to get table information
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_info', { table_name: 'profiles' })
        .single()

      if (tableError) {
        // If RPC doesn't exist, try a different approach
        console.log("RPC not available, using alternative method")
      }

      // Based on the data structure, determine the schema
      if (data && data.length > 0) {
        const sample = data[0]
        if (sample.id && sample.user_id) {
          setResults({ schema: "simple" })
        } else if (sample.id && !sample.user_id) {
          setResults({ schema: "main" })
        } else {
          setResults({ schema: "unknown" })
        }
      } else {
        setResults({ schema: "empty" })
      }

    } catch (err: any) {
      setResults({ schema: null, error: err.message })
    }

    setTesting(false)
  }

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <div className="w-5 h-5 bg-gray-300 rounded-full" />
    return status ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Database Schema Test</CardTitle>
        <CardDescription>Check which profiles table schema is being used</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testSchema} disabled={testing} className="w-full">
          {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Test Schema
        </Button>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Schema Type:</span>
            <span className="font-medium">
              {results.schema ? (
                <Badge variant={results.schema === "main" ? "default" : "secondary"}>
                  {results.schema}
                </Badge>
              ) : (
                "Unknown"
              )}
            </span>
          </div>
        </div>

        {results.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">Error: {results.error}</p>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>Schema Types:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>main:</strong> id = user_id (references auth.users)</li>
            <li><strong>simple:</strong> id = UUID, user_id = foreign key</li>
            <li><strong>empty:</strong> Table exists but no data</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

function Badge({ variant, children }: { variant: "default" | "secondary", children: React.ReactNode }) {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800"
  }
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </span>
  )
} 