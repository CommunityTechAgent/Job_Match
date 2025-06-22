"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, X, Download, Eye, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

interface ResumeFile {
  name: string
  size: number
  type: string
  lastModified: number
}

export function ResumeUpload() {
  const { user, profile, supabase } = useAuth()
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

  // Upload file
  const handleUpload = async () => {
    if (!file || !user || !supabase) return

    try {
      setUploading(true)
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

      // Create signed URL for preview
      const { data: signedUrlData } = await supabase.storage
        .from('resumes')
        .createSignedUrl(fileName, 3600) // 1 hour expiry

      if (!signedUrlData?.signedUrl) {
        throw new Error('Failed to create signed URL')
      }

      // Update user profile with resume reference
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          resume_path: fileName,
          resume_filename: file.name,
          resume_updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      toast.success('Resume uploaded successfully!')
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
      toast.error(`Upload failed: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  // Delete current resume
  const handleDelete = async () => {
    if (!user || !supabase || !profile?.resume_path) return

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
          resume_updated_at: null
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
    if (!profile?.resume_path || !supabase) return null

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
              <span>Uploading...</span>
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