"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  User,
  Upload,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
  Camera,
  Save,
  Plus,
  X,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuth()
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    bio: "",
    experience_level: "",
    job_type_preference: "",
    skills: [] as string[],
  })
  const [newSkill, setNewSkill] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: user?.email || "",
        phone: profile.phone || "",
        location: profile.location || "",
        headline: profile.headline || "",
        bio: profile.bio || "",
        experience_level: profile.experience_level || "",
        job_type_preference: profile.job_type_preference || "",
        skills: profile.skills || [],
      })
      calculateCompletion()
    }
  }, [profile, user])

  const calculateCompletion = () => {
    const fields = [
      formData.full_name,
      formData.phone,
      formData.location,
      formData.headline,
      formData.bio,
      formData.experience_level,
      formData.job_type_preference,
      formData.skills.length > 0,
    ]
    const completed = fields.filter((field) => field && field !== "").length
    setProfileCompletion(Math.round((completed / fields.length) * 100))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      console.log("Saving profile:", formData)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setSigningOut(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "photo" | "resume") => {
    const file = event.target.files?.[0]
    if (!file) return
    console.log(`Uploading ${type}:`, file.name)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const completionItems = [
    {
      label: "Basic Information",
      completed: !!(formData.full_name && formData.phone && formData.location),
      icon: User,
    },
    { label: "Profile Photo", completed: false, icon: Camera },
    { label: "Resume Upload", completed: false, icon: FileText },
    {
      label: "Job Preferences",
      completed: !!(formData.experience_level && formData.job_type_preference),
      icon: Settings,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="flex items-center space-x-2 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={profileCompletion >= 80 ? "default" : "secondary"} className="px-3 py-1">
                {profileCompletion}% Complete
              </Badge>
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                disabled={signingOut}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
              >
                {signingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                    Signing Out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Profile Completion</span>
                </CardTitle>
                <CardDescription>Complete your profile to get better job matches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-3" />
                </div>

                <div className="space-y-4">
                  {completionItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${item.completed ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-sm text-gray-900 mb-3">💡 Quick Tips</h4>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Add a professional photo to increase profile views by 40%</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Upload your latest resume for better AI matching</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Set specific job preferences to get targeted opportunities</span>
                    </li>
                  </ul>
                </div>

                {/* User Info Card */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={profile?.avatar_url || "/placeholder-user.jpg"} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                        {formData.full_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{formData.full_name || "Your Name"}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
                  >
                    {signingOut ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                        Signing Out...
                      </>
                    ) : (
                      <>
                        <LogOut className="w-3 h-3 mr-2" />
                        Sign Out
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Photo Section */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <span>Profile Photo</span>
                </CardTitle>
                <CardDescription>Add a professional photo to make a great first impression</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage src={profile?.avatar_url || "/placeholder-user.jpg"} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {formData.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "photo")}
                        className="hidden"
                        id="photo-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("photo-upload")?.click()}
                        className="w-full sm:w-auto"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </Button>
                      <p className="text-xs text-gray-500">JPG, PNG up to 5MB. Square images work best.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resume Upload Section */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span>Resume Upload</span>
                </CardTitle>
                <CardDescription>
                  Upload your resume to help employers find you and improve job matching
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your resume</h3>
                  <p className="text-gray-600 mb-4">Drag and drop your file here, or click to browse</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, "resume")}
                    className="hidden"
                    id="resume-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("resume-upload")?.click()}
                    className="mb-2"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-600" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>Your personal and contact information</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      placeholder="Enter your full name"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="pl-10 h-11 bg-gray-50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">
                      Location
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="Washington, DC"
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headline" className="text-sm font-medium">
                    Professional Headline
                  </Label>
                  <Input
                    id="headline"
                    value={formData.headline}
                    onChange={(e) => handleInputChange("headline", e.target.value)}
                    placeholder="e.g., Senior Frontend Developer with 5+ years experience"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">
                    Professional Summary
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Brief summary of your experience, skills, and career goals..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Job Preferences */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                  <span>Job Preferences</span>
                </CardTitle>
                <CardDescription>Help us find the perfect opportunities for you</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="experience_level" className="text-sm font-medium">
                      Experience Level
                    </Label>
                    <Select
                      value={formData.experience_level}
                      onValueChange={(value) => handleInputChange("experience_level", value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                        <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                        <SelectItem value="executive">Executive/C-Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_type_preference" className="text-sm font-medium">
                      Preferred Job Type
                    </Label>
                    <Select
                      value={formData.job_type_preference}
                      onValueChange={(value) => handleInputChange("job_type_preference", value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select preferred job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-teal-600" />
                  <span>Skills & Expertise</span>
                </CardTitle>
                <CardDescription>Add your key skills to improve job matching</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-500 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {formData.skills.length === 0 && (
                    <p className="text-gray-500 text-sm">
                      No skills added yet. Add some skills to improve your job matches.
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g., JavaScript, Project Management)"
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    className="flex-1 h-11"
                  />
                  <Button onClick={addSkill} disabled={!newSkill.trim()} className="px-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="text-xs text-gray-500">
                  <p>
                    💡 <strong>Tip:</strong> Add 5-10 relevant skills that match your experience and the jobs you're
                    interested in.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
