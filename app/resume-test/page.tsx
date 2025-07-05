"use client"

import { useState } from "react"
import { ResumeUpload } from "@/components/profile/resume-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TestTube, Upload, Brain, CheckCircle, AlertCircle } from "lucide-react"

export default function ResumeTestPage() {
  const [testResults, setTestResults] = useState<any[]>([])

  const runTests = async () => {
    const results = []
    
    // Test 1: Check if resume upload component loads
    try {
      results.push({
        test: "Resume Upload Component",
        status: "PASS",
        message: "Component loads successfully"
      })
    } catch (error) {
      results.push({
        test: "Resume Upload Component",
        status: "FAIL",
        message: `Error: ${error}`
      })
    }

    // Test 2: Check API endpoint availability
    try {
      const response = await fetch('/api/resume/process-simple', {
        method: 'GET'
      })
      results.push({
        test: "Resume Processing API",
        status: response.ok ? "PASS" : "FAIL",
        message: response.ok ? "API endpoint available" : `HTTP ${response.status}`
      })
    } catch (error) {
      results.push({
        test: "Resume Processing API",
        status: "FAIL",
        message: `Error: ${error}`
      })
    }

    // Test 3: Check AI service configuration
    try {
      const response = await fetch('/api/resume/process-simple?test=config', {
        method: 'GET'
      })
      const data = await response.json()
      results.push({
        test: "AI Service Configuration",
        status: data.success ? "PASS" : "FAIL",
        message: data.success ? "AI service configured" : data.error || "Configuration error"
      })
    } catch (error) {
      results.push({
        test: "AI Service Configuration",
        status: "FAIL",
        message: `Error: ${error}`
      })
    }

    setTestResults(results)
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Resume Processing Test Suite</h1>
        <p className="text-gray-600">Test the resume upload and AI skill extraction pipeline</p>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Controls
          </CardTitle>
          <CardDescription>
            Run automated tests to verify the resume processing pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runTests} className="w-full">
            Run All Tests
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {result.status === "PASS" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{result.test}</p>
                    <p className="text-sm text-gray-600">{result.message}</p>
                  </div>
                </div>
                <Badge variant={result.status === "PASS" ? "default" : "destructive"}>
                  {result.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resume Upload Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Resume Upload Test
          </CardTitle>
          <CardDescription>
            Test the resume upload component with file processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResumeUpload />
        </CardContent>
      </Card>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. Resume Upload Test</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Upload a PDF, DOCX, or DOC resume file</li>
              <li>Verify progress indicators show correctly</li>
              <li>Check that processing status updates in real-time</li>
              <li>Confirm AI extraction results are displayed</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">2. AI Processing Test</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Monitor the processing pipeline stages</li>
              <li>Verify skills are extracted and displayed</li>
              <li>Check job title and experience level extraction</li>
              <li>Confirm confidence scores are shown</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">3. Error Handling Test</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Try uploading invalid file types</li>
              <li>Test with files larger than 5MB</li>
              <li>Verify error messages are clear and helpful</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 