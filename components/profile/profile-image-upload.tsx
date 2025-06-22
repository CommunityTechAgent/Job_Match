"use client"

import { useState, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X, Camera, User, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

interface ProfileImageFile {
  name: string
  size: number
  type: string
  lastModified: number
  preview?: string
}

export function ProfileImageUpload() {
  const { user, profile, supabase } = useAuth()
  const [file, setFile] = useState<ProfileImageFile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // File validation constants
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 1 * 1024 * 1024 // 1MB
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']

  // Validate file
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Check file type
    if (!allowedTypes.includes(file.type) && !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      return { isValid: false, error: 'File must be JPG, PNG, or WebP format' }
    }

    // Check file size
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 1MB' }
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

    // Create preview URL
    const preview = URL.createObjectURL(selectedFile)

    setFile({
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      lastModified: selectedFile.lastModified,
      preview
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
      setError(null)

      // Get the actual file from the input
      const actualFile = fileInputRef.current?.files?.[0]
      if (!actualFile) {
        throw new Error('File not found')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${user.id}/${uuidv4()}.${fileExt}`

      // Upload file
      const { error: uploadError, data } = await supabase.storage
        .from('profile-images')
        .upload(fileName, actualFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Create signed URL for preview
      const { data: signedUrlData } = await supabase.storage
        .from('profile-images')
        .createSignedUrl(fileName, 3600) // 1 hour expiry

      if (!signedUrlData?.signedUrl) {
        throw new Error('Failed to create signed URL')
      }

      // Update user profile with image reference
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          profile_image_url: fileName
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      toast.success('Profile image uploaded successfully!')
      setFile(null)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Clean up preview URL
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
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

  // Delete current profile image
  const handleDelete = async () => {
    if (!user || !supabase || !profile?.profile_image_url) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('profile-images')
        .remove([profile.profile_image_url])

      if (storageError) throw storageError

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          profile_image_url: null
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      toast.success('Profile image deleted successfully!')
    } catch (error) {
      console.error('Delete error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Delete failed'
      toast.error(`Delete failed: ${errorMessage}`)
    }
  }

  // Get signed URL for current profile image
  const getCurrentImageUrl = async () => {
    if (!profile?.profile_image_url || !supabase) return null

    try {
      const { data: signedUrlData } = await supabase.storage
        .from('profile-images')
        .createSignedUrl(profile.profile_image_url, 3600)
      return signedUrlData?.signedUrl || null
    } catch (error) {
      console.error('Error getting image URL:', error)
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
          <Camera className="h-5 w-5" />
          Profile Image
        </CardTitle>
        <CardDescription>
          Upload a professional headshot (JPG, PNG, or WebP, max 1MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Profile Image Display */}
        {profile?.profile_image_url && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <Avatar className="h-16 w-16">
                  <AvatarImage 
                    src={profile.profile_image_url} 
                    alt="Profile"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                  <AvatarFallback className="text-lg">
                    {profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-green-900">Current Profile Image</p>
                  <p className="text-sm text-green-700">Click to view or replace</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const url = await getCurrentImageUrl()
                    if (url) window.open(url, '_blank')
                  }}
                >
                  <Camera className="h-4 w-4 mr-1" />
                  View
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
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInputChange}
            disabled={uploading}
            className="hidden"
          />
          
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            <p className="text-sm text-gray-600">
              Drag and drop your profile image here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-blue-600 hover:text-blue-700 underline disabled:opacity-50"
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, or WebP files up to 1MB
            </p>
          </div>
        </div>

        {/* Selected File Display */}
        {file && (
          <div className="p-3 bg-gray-50 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {file.preview && (
                  <img 
                    src={file.preview} 
                    alt="Preview" 
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null)
                  if (file.preview) {
                    URL.revokeObjectURL(file.preview)
                  }
                }}
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

        {/* Upload Button */}
        {file && !uploading && (
          <Button
            onClick={handleUpload}
            className="w-full"
            disabled={!file}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Profile Image
          </Button>
        )}

        {/* Loading State */}
        {uploading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Uploading...</p>
          </div>
        )}

        {/* File Type Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">JPG</Badge>
          <Badge variant="secondary">PNG</Badge>
          <Badge variant="secondary">WebP</Badge>
          <Badge variant="outline">Max 1MB</Badge>
        </div>
      </CardContent>
    </Card>
  )
} 