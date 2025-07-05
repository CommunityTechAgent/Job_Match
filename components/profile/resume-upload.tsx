"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileCheck,
} from "lucide-react"
import { toast } from "sonner"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

const TYPE_LABELS = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
}

export function ResumeUpload() {
  const { user, profile, updateProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Please upload a PDF, DOC, or DOCX file"
    }

    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 10MB"
    }

    return null
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      uploadFile(file)
    },
    [validateFile],
  )

  // Handle file input change
  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect],
  )

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setDragOver(false)

      const file = event.dataTransfer.files[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect],
  )

  // Upload file to Supabase Storage
  const uploadFile = useCallback(
    async (file: File) => {
      if (!user) {
        setError("You must be logged in to upload files")
        return
      }

      const supabase = createSupabaseClient()
      if (!supabase) {
        setError("Failed to initialize storage connection")
        return
      }

      try {
        setUploading(true)
        setUploadProgress(0)
        setError(null)

        // Generate unique filename
        const fileExt = file.name.split(".").pop()
        const fileName = `${user.id}-resume-${Date.now()}.${fileExt}`
        const filePath = `resumes/${fileName}`

        // Upload to Supabase Storage with progress tracking
        const { data: uploadData, error: uploadError } = await supabase.storage.from("resumes").upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        })

        if (uploadError) {
          throw uploadError
        }

        // Get public URL (for download purposes)
        const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(filePath)

        // Update user profile with resume information
        const { error: updateError } = await updateProfile({
          resume_url: filePath, // Store the file path, not the public URL for security
          resume_filename: file.name,
          resume_updated_at: new Date().toISOString(),
        })

        if (updateError) {
          throw updateError
        }

        setUploadProgress(100)
        toast.success("Resume uploaded successfully!")

        // Clear progress after successful upload
        setTimeout(() => {
          setUploadProgress(0)
        }, 2000)
      } catch (error: any) {
        console.error("Error uploading resume:", error)
        setError(error.message || "Failed to upload resume")
        toast.error("Failed to upload resume")
      } finally {
        setUploading(false)
      }
    },
    [user, updateProfile],
  )

  // Download resume
  const downloadResume = useCallback(async () => {
    if (!user || !profile?.resume_url) return

    const supabase = createSupabaseClient()
    if (!supabase) {
      setError("Failed to initialize storage connection")
      return
    }

    try {
      // Download file from storage
      const { data, error } = await supabase.storage.from("resumes").download(profile.resume_url)

      if (error) {
        throw error
      }

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = profile.resume_filename || "resume.pdf"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Resume downloaded successfully!")
    } catch (error: any) {
      console.error("Error downloading resume:", error)
      setError(error.message || "Failed to download resume")
      toast.error("Failed to download resume")
    }
  }, [user, profile])

  // Remove resume
  const removeResume = useCallback(async () => {
    if (!user || !profile?.resume_url) return

    const supabase = createSupabaseClient()
    if (!supabase) {
      setError("Failed to initialize storage connection")
      return
    }

    try {
      setUploading(true)

      // Delete from storage
      const { error: deleteError } = await supabase.storage.from("resumes").remove([profile.resume_url])

      if (deleteError) {
        console.warn("Failed to delete file from storage:", deleteError)
      }

      // Update profile to remove resume information
      const { error: updateError } = await updateProfile({
        resume_url: null,
        resume_filename: null,
        resume_updated_at: null,
      })

      if (updateError) {
        throw updateError
      }

      toast.success("Resume removed successfully!")
    } catch (error: any) {
      console.error("Error removing resume:", error)
      setError(error.message || "Failed to remove resume")
      toast.error("Failed to remove resume")
    } finally {
      setUploading(false)
    }
  }, [user, profile, updateProfile])

  // Trigger file input
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Format file size
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }, [])

  // Get file type from filename
  const getFileType = useCallback((filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "pdf":
        return "application/pdf"
      case "doc":
        return "application/msword"
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      default:
        return "application/pdf"
    }
  }, [])

  const hasResume = profile?.resume_url && profile?.resume_filename
  const resumeUpdatedAt = profile?.resume_updated_at ? new Date(profile.resume_updated_at) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resume
        </CardTitle>
        <CardDescription>
          Upload your resume to improve job matching and allow employers to learn more about you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Resume Display */}
        {hasResume ? (
          <div className="p-4 border rounded-lg bg-green-50 border-green-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-green-900">{profile.resume_filename}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-green-700">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {TYPE_LABELS[getFileType(profile.resume_filename) as keyof typeof TYPE_LABELS] || "Document"}
                    </Badge>
                    {resumeUpdatedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Updated {resumeUpdatedAt.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadResume} disabled={uploading}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeResume}
                  disabled={uploading}
                  className="text-red-600 hover:text-red-700 bg-transparent"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Upload Area */
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {dragOver ? "Drop your resume here" : "Upload your resume"}
                </h3>
                <p className="text-gray-600 mb-4">Drag and drop your file here, or click to browse</p>

                <Button onClick={triggerFileInput} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Choose File
                </Button>
              </div>

              <div className="text-sm text-gray-500">
                <p>Supported formats: PDF, DOC, DOCX</p>
                <p>Maximum file size: 10MB</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading resume...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Upload Guidelines */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-900 mb-2">Resume Tips</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Keep your resume updated with recent experience</li>
                <li>• Use keywords relevant to your target positions</li>
                <li>• Ensure your contact information is current</li>
                <li>• PDF format is preferred for better compatibility</li>
                <li>• File name should be professional (e.g., "John_Doe_Resume.pdf")</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {uploadProgress === 100 && !uploading && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Resume uploaded successfully! Employers can now view and download your resume.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
