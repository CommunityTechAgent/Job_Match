"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Database, CheckCircle, XCircle, Upload, Settings } from 'lucide-react'

export default function BrowserAiTestPage() {
  const [loading, setLoading] = useState(false)
  const [configStatus, setConfigStatus] = useState<any>(null)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [sampleData, setSampleData] = useState<string>(`[
  {
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "location": "San Francisco, CA",
    "description": "We are looking for a senior software engineer to join our team...",
    "requirements": "5+ years experience, React, Node.js, TypeScript",
    "salary": "$120,000 - $150,000",
    "job_type": "Full-time",
    "experience_level": "Senior",
    "remote_friendly": true,
    "url": "https://example.com/job/123"
  },
  {
    "title": "Product Manager",
    "company": "Startup Inc",
    "location": "New York, NY",
    "description": "Join our fast-growing startup as a product manager...",
    "requirements": "3+ years PM experience, Agile, User Research",
    "salary": "$100,000 - $130,000",
    "job_type": "Full-time",
    "experience_level": "Mid-level",
    "remote_friendly": false,
    "url": "https://example.com/job/456"
  }
]`)

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/browser-ai-to-airtable')
      const config = await response.json()
      setConfigStatus(config)
    } catch (err) {
      setError('Failed to check configuration')
    }
  }

  const sendBrowserAiData = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      // Parse the sample data
      const jobData = JSON.parse(sampleData)
      
      const response = await fetch('/api/browser-ai-to-airtable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send data to Airtable')
      }

      const result = await response.json()
      setResults(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Browser AI to Airtable Integration
          </CardTitle>
          <CardDescription>
            Test sending browser AI job data to your Airtable jobs table.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={checkConfiguration}
              className="flex items-center gap-2 bg-gray-100 text-gray-900 hover:bg-gray-200"
            >
              <Settings className="w-4 h-4" />
              Check Configuration
            </Button>
          </div>

          {configStatus && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Configuration Status:</strong><br />
                • Configured: {configStatus.configured ? '✅ Yes' : '❌ No'}<br />
                • Base ID: {configStatus.baseId}<br />
                • Table Name: {configStatus.tableName}<br />
                • Token Set: {configStatus.tokenSet ? '✅ Yes' : '❌ No'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Test Data Upload
          </CardTitle>
          <CardDescription>
            Edit the sample data below and send it to Airtable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Browser AI Job Data (JSON Array):
            </label>
            <Textarea
              value={sampleData}
              onChange={(e) => setSampleData(e.target.value)}
              rows={15}
              className="font-mono text-sm"
              placeholder="Paste your browser AI job data here..."
            />
          </div>

          <Button 
            onClick={sendBrowserAiData} 
            disabled={loading || !configStatus?.configured}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending to Airtable...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Send to Airtable
              </>
            )}
          </Button>

          {error && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {results && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">
                  Upload Complete: {results.summary.successful}/{results.summary.total} successful
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="font-medium mb-2 text-green-800">✅ Successful Uploads:</h3>
                  <ul className="text-sm space-y-1">
                    {results.results.map((result: any, index: number) => (
                      <li key={index} className="text-green-700">
                        {result.job} (ID: {result.airtableId?.substring(0, 8)}...)
                      </li>
                    ))}
                  </ul>
                </div>

                {results.errors.length > 0 && (
                  <div className="border rounded-lg p-4 bg-red-50">
                    <h3 className="font-medium mb-2 text-red-800">❌ Failed Uploads:</h3>
                    <ul className="text-sm space-y-1">
                      {results.errors.map((error: any, index: number) => (
                        <li key={index} className="text-red-700">
                          {error.job}: {error.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>Add these to your .env.local file:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li><code>AIRTABLE_TOKEN</code> - Your Airtable API token</li>
              <li><code>AIRTABLE_BASE_ID</code> - Your Airtable base ID</li>
              <li><code>AIRTABLE_TABLE_NAME</code> - Your table name (defaults to "Jobs")</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
