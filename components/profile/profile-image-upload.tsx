"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Camera, Trash2, Loader2, CheckCircle, AlertCircle, ImageIcon } from "lucide-react"
import { toast } from "sonner"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export function ProfileImageUpload() {
  const { user, profile, updateProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Please upload a JPEG, PNG, or WebP image"
    }

    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 5MB"
    }

    return null
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file
      uploadFile(file)
    },
    [validateFile],
  )

  // Upload file to Supabase Storage
  const uploadFile = useCallback(
    async (file: File) => {
      if (!user) {
        setError("You must be logged in to upload images")
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
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `profile-images/${fileName}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          })

        if (uploadError) {
          throw uploadError
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from("profile-images").getPublicUrl(filePath)

        if (!urlData?.publicUrl) {
          throw new Error("Failed to get image URL")
        }

        // Update user profile with new avatar URL
        const { error: updateError } = await updateProfile({
          avatar_url: urlData.publicUrl,
        })

        if (updateError) {
          throw updateError
        }

        setUploadProgress(100)
        toast.success("Profile image updated successfully!")

        // Clear preview after successful upload
        setTimeout(() => {
          setPreviewUrl(null)
          setUploadProgress(0)
        }, 2000)
      } catch (error: any) {
        console.error("Error uploading image:", error)
        setError(error.message || "Failed to upload image")
        toast.error("Failed to upload image")
      } finally {
        setUploading(false)
      }
    },
    [user, updateProfile],
  )

  // Remove profile image
  const removeImage = useCallback(async () => {
    if (!user || !profile?.avatar_url) return

    const supabase = createSupabaseClient()
    if (!supabase) {
      setError("Failed to initialize storage connection")
      return
    }

    try {
      setUploading(true)

      // Extract file path from URL
      const url = new URL(profile.avatar_url)
      const filePath = url.pathname.split("/").slice(-2).join("/")

      // Delete from storage
      const { error: deleteError } = await supabase.storage.from("profile-images").remove([filePath])

      if (deleteError) {
        console.warn("Failed to delete file from storage:", deleteError)
      }

      // Update profile to remove avatar URL
      const { error: updateError } = await updateProfile({
        avatar_url: null,
      })

      if (updateError) {
        throw updateError
      }

      toast.success("Profile image removed successfully!")
    } catch (error: any) {
      console.error("Error removing image:", error)
      setError(error.message || "Failed to remove image")
      toast.error("Failed to remove image")
    } finally {
      setUploading(false)
    }
  }, [user, profile, updateProfile])

  // Trigger file input
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const currentImageUrl = previewUrl || profile?.avatar_url
  const userName = profile?.full_name || user?.email?.split("@")[0] || "User"
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Profile Image
        </CardTitle>
        <CardDescription>Upload a professional profile photo to make a great first impression</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Image Display */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-gray-200">
              <AvatarImage src={currentImageUrl || "/placeholder-user.jpg"} alt="Profile" className="object-cover" />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            {/* Upload Progress Overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <div className="text-sm">{uploadProgress}%</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={triggerFileInput} disabled={uploading} className="flex-1">
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {currentImageUrl ? "Change Photo" : "Upload Photo"}
          </Button>

          {profile?.avatar_url && (
            <Button
              variant="outline"
              onClick={removeImage}
              disabled={uploading}
              className="text-red-600 hover:text-red-700 bg-transparent"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Guidelines */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <ImageIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-900 mb-2">Photo Guidelines</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Use a high-quality, professional headshot</li>
                <li>• Face should be clearly visible and well-lit</li>
                <li>• Supported formats: JPEG, PNG, WebP</li>
                <li>• Maximum file size: 5MB</li>
                <li>• Recommended size: 400x400 pixels or larger</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {uploadProgress === 100 && !uploading && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Profile image updated successfully! Your new photo will appear across the platform.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
