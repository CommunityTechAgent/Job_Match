"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Database, CheckCircle, XCircle } from 'lucide-react'

export default function AirtableTestPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchAirtableData = async () => {
    setLoading(true)
    setError(null)
    setData([])

    try {
      const response = await fetch('/api/airtable-fetch')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch data')
      }

      const records = await response.json()
      setData(records)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Airtable Data Fetch Test
          </CardTitle>
          <CardDescription>
            Test the Airtable API integration by fetching data from your configured base and table.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={fetchAirtableData} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fetching Data...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Fetch Airtable Data
              </>
            )}
          </Button>

          {error && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {data.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Successfully fetched {data.length} records</span>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Raw Data Preview:</h3>
                <pre className="text-sm overflow-auto max-h-96">
                  {JSON.stringify(data.slice(0, 3), null, 2)}
                  {data.length > 3 && `\n... and ${data.length - 3} more records`}
                </pre>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p><strong>Environment Variables Required:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><code>AIRTABLE_TOKEN</code> - Your Airtable API token</li>
              <li><code>AIRTABLE_BASE_ID</code> - Your Airtable base ID</li>
              <li><code>AIRTABLE_TABLE_NAME</code> - Your table name</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 