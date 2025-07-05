"use client"

import { useState, useCallback, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, X, Download, Eye, AlertCircle, CheckCircle, Loader2, Brain, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

interface ResumeFile {
  name: string
  size: number
  type: string
  lastModified: number
}

export function ResumeUpload() {
  const { user, profile } = useAuth()
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'uploading' | 'processing' | 'extracting' | 'completed' | 'failed'>('idle')
  const [processingProgress, setProcessingProgress] = useState(0)
  const [extractedSkills, setExtractedSkills] = useState<string[]>([])
  const [jobTitle, setJobTitle] = useState<string>('')
  const [experienceLevel, setExperienceLevel] = useState<string>('')
  const [statusPolling, setStatusPolling] = useState<NodeJS.Timeout | null>(null)
  const [file, setFile] = useState<ResumeFile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // File validation constants
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ]
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedExtensions = ['.pdf', '.docx', '.doc']

  // Validate file
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Check file type
    if (!allowedTypes.includes(file.type) && !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      return { isValid: false, error: 'File must be PDF, DOCX, or DOC format' }
    }

    // Check file size
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 5MB' }
    }

    // Check file name
    if (file.name.length > 100) {
      return { isValid: false, error: 'File name must be less than 100 characters' }
    }

    return { isValid: true }
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile: File) => {
    setError(null)
    
    const validation = validateFile(selectedFile)
    if (!validation.isValid) {
      setError(validation.error!)
      return
    }

    setFile({
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      lastModified: selectedFile.lastModified
    })
  }, [validateFile])

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }, [handleFileSelect])

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [handleFileSelect])

  // Upload file with new processing pipeline
  const handleUpload = async () => {
    if (!file || !user) return

    const supabase = createSupabaseClient()
    if (!supabase) {
      setError('Failed to initialize database connection')
      return
    }

    try {
      setUploading(true)
      setProcessingStatus('uploading')
      setProgress(0)
      setError(null)

      // Get the actual file from the input
      const fileInput = document.getElementById('resume-file-input') as HTMLInputElement
      const actualFile = fileInput?.files?.[0]
      if (!actualFile) {
        throw new Error('File not found')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf'
      const fileName = `${user.id}/${uuidv4()}.${fileExt}`

      // Upload file with progress tracking
      const { error: uploadError, data } = await supabase.storage
        .from('resumes')
        .upload(fileName, actualFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      setProgress(50)
      setProcessingStatus('processing')

      // Update user profile with resume reference
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          resume_path: fileName,
          resume_filename: file.name,
          resume_updated_at: new Date().toISOString(),
          resume_parsing_status: 'pending'
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      setProgress(75)
      setProcessingStatus('extracting')

      // Process resume with AI extraction
      const formData = new FormData()
      formData.append('file', actualFile)
      formData.append('profileId', user.id)

      const processResponse = await fetch('/api/resume/process', {
        method: 'POST',
        body: formData
      })

      if (!processResponse.ok) {
        const errorData = await processResponse.json()
        throw new Error(errorData.error || 'Failed to process resume')
      }

      const processData = await processResponse.json()
      
      setProgress(100)
      setProcessingStatus('completed')
      
      // Update extracted data
      if (processData.data) {
        setExtractedSkills(processData.data.skills || [])
        setJobTitle(processData.data.jobTitle || '')
        setExperienceLevel(processData.data.experienceLevel || '')
      }

      toast.success('Resume uploaded and processed successfully!')
      setFile(null)
      setProgress(0)
      
      // Reset file input
      if (fileInput) {
        fileInput.value = ''
      }

    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setError(errorMessage)
      setProcessingStatus('failed')
      toast.error(`Upload failed: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  // Delete current resume
  const handleDelete = async () => {
    if (!user || !profile?.resume_path) return

    const supabase = createSupabaseClient()
    if (!supabase) {
      setError('Failed to initialize database connection')
      return
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([profile.resume_path])

      if (storageError) throw storageError

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          resume_path: null,
          resume_filename: null,
          resume_updated_at: null,
          resume_parsing_status: null,
          ai_skills_extracted: false
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      toast.success('Resume deleted successfully!')
    } catch (error) {
      console.error('Delete error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Delete failed'
      toast.error(`Delete failed: ${errorMessage}`)
    }
  }

  // Get signed URL for current resume
  const getCurrentResumeUrl = async () => {
    if (!profile?.resume_path) return null

    const supabase = createSupabaseClient()
    if (!supabase) return null

    try {
      const { data: signedUrlData } = await supabase.storage
        .from('resumes')
        .createSignedUrl(profile.resume_path, 3600)
      return signedUrlData?.signedUrl || null
    } catch (error) {
      console.error('Error getting resume URL:', error)
      return null
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Poll processing status
  const pollProcessingStatus = useCallback(async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/resume/process?profileId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const { resumeParsing, aiSkillsExtraction, overallStatus } = data.data
          
          // Update processing status based on overall status
          if (overallStatus === 'processing') {
            setProcessingStatus('processing')
            setProcessingProgress(50)
          } else if (overallStatus === 'text_extracted') {
            setProcessingStatus('extracting')
            setProcessingProgress(75)
          } else if (overallStatus === 'fully_processed') {
            setProcessingStatus('completed')
            setProcessingProgress(100)
            
            // Update extracted data
            if (aiSkillsExtraction.skills) {
              setExtractedSkills(aiSkillsExtraction.skills)
            }
            if (aiSkillsExtraction.jobTitle) {
              setJobTitle(aiSkillsExtraction.jobTitle)
            }
            if (aiSkillsExtraction.experienceLevel) {
              setExperienceLevel(aiSkillsExtraction.experienceLevel)
            }
            
            // Stop polling
            if (statusPolling) {
              clearInterval(statusPolling)
              setStatusPolling(null)
            }
          } else if (overallStatus === 'failed') {
            setProcessingStatus('failed')
            if (statusPolling) {
              clearInterval(statusPolling)
              setStatusPolling(null)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error polling status:', error)
    }
  }, [user?.id, statusPolling])

  // Start polling when processing begins
  useEffect(() => {
    if (processingStatus === 'processing' || processingStatus === 'extracting') {
      if (!statusPolling) {
        const interval = setInterval(pollProcessingStatus, 2000) // Poll every 2 seconds
        setStatusPolling(interval)
      }
    } else if (processingStatus === 'completed' || processingStatus === 'failed') {
      if (statusPolling) {
        clearInterval(statusPolling)
        setStatusPolling(null)
      }
    }

    return () => {
      if (statusPolling) {
        clearInterval(statusPolling)
      }
    }
  }, [processingStatus, statusPolling, pollProcessingStatus])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resume Upload
        </CardTitle>
        <CardDescription>
          Upload your resume in PDF, DOCX, or DOC format (max 5MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Resume Display */}
        {profile?.resume_path && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">
                    {profile.resume_filename || 'Current Resume'}
                  </p>
                  <p className="text-sm text-green-700">
                    Uploaded {profile.resume_updated_at ? 
                      new Date(profile.resume_updated_at).toLocaleDateString() : 
                      'recently'
                    }
                  </p>
                  {/* Processing Status */}
                  {profile.resume_parsing_status && (
                    <div className="flex items-center gap-2 mt-1">
                      {profile.resume_parsing_status === 'processing' && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-xs">Processing...</span>
                        </div>
                      )}
                      {profile.resume_parsing_status === 'completed' && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <span className="text-xs">Text extracted</span>
                        </div>
                      )}
                      {profile.resume_parsing_status === 'failed' && (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          <span className="text-xs">Processing failed</span>
                        </div>
                      )}
                      {profile.ai_skills_extracted && (
                        <div className="flex items-center gap-1 text-purple-600">
                          <Brain className="h-3 w-3" />
                          <span className="text-xs">AI skills extracted</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const url = await getCurrentResumeUrl()
                    if (url) window.open(url, '_blank')
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const url = await getCurrentResumeUrl()
                    if (url) {
                      const link = document.createElement('a')
                      link.href = url
                      link.download = profile.resume_filename || 'resume.pdf'
                      link.click()
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                >
                  <X className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
            
            {/* AI Extraction Results */}
            {profile.ai_skills_extracted && profile.skills && profile.skills.length > 0 && (
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">AI Extracted Skills</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {profile.skills.slice(0, 10).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {profile.skills.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.skills.length - 10} more
                    </Badge>
                  )}
                </div>
                {profile.ai_extracted_job_title && (
                  <p className="text-xs text-purple-700 mt-2">
                    <strong>Job Title:</strong> {profile.ai_extracted_job_title}
                  </p>
                )}
                {profile.ai_extracted_experience_level && (
                  <p className="text-xs text-purple-700">
                    <strong>Experience Level:</strong> {profile.ai_extracted_experience_level}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            id="resume-file-input"
            type="file"
            accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
            onChange={handleFileInputChange}
            disabled={uploading}
            className="hidden"
          />
          
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            <p className="text-sm text-gray-600">
              Drag and drop your resume here, or{' '}
              <button
                type="button"
                onClick={() => document.getElementById('resume-file-input')?.click()}
                disabled={uploading}
                className="text-blue-600 hover:text-blue-700 underline disabled:opacity-50"
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-gray-500">
              PDF, DOCX, or DOC files up to 5MB
            </p>
          </div>
        </div>

        {/* Selected File Display */}
        {file && (
          <div className="p-3 bg-gray-50 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Progress Bar */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                {processingStatus === 'uploading' && <Upload className="h-3 w-3" />}
                {processingStatus === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
                {processingStatus === 'extracting' && <Brain className="h-3 w-3" />}
                {processingStatus === 'completed' && <CheckCircle className="h-3 w-3" />}
                {processingStatus === 'failed' && <AlertCircle className="h-3 w-3" />}
                {processingStatus === 'uploading' && 'Uploading...'}
                {processingStatus === 'processing' && 'Processing resume...'}
                {processingStatus === 'extracting' && 'Extracting skills with AI...'}
                {processingStatus === 'completed' && 'Completed!'}
                {processingStatus === 'failed' && 'Failed'}
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Upload Button */}
        {file && !uploading && (
          <Button
            onClick={handleUpload}
            className="w-full"
            disabled={!file}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Resume
          </Button>
        )}

        {/* File Type Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">PDF</Badge>
          <Badge variant="secondary">DOCX</Badge>
          <Badge variant="secondary">DOC</Badge>
          <Badge variant="outline">Max 5MB</Badge>
        </div>
      </CardContent>
    </Card>
  )
} 