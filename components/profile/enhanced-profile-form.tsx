"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  User,
  MapPin,
  Briefcase,
  Phone,
  Globe,
  Linkedin,
  Github,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Star,
  Building,
  Target,
  FileText,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import type { Profile, EducationEntry, SalaryRange } from "@/lib/supabase"
import { profileValidator } from "@/lib/validation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
// Remove these imports for now - we'll create inline versions

interface EnhancedProfileFormData {
  // Basic Information
  full_name: string
  headline: string
  bio: string
  location: string
  phone: string
  date_of_birth: string

  // Professional Information
  job_title: string
  experience_level: string
  experience_years: number
  skills: string[]
  education: EducationEntry[]

  // Preferences
  preferred_job_types: string[]
  preferred_locations: string[]
  preferred_salary_range: SalaryRange
  availability_status: string
  work_authorization: string
  remote_preference: string
  relocation_willingness: string

  // Social Links
  website: string
  linkedin_url: string
  github_url: string
  portfolio_url: string
}

export function EnhancedProfileForm() {
  const { user, profile, updateProfile, loading } = useAuth()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<EnhancedProfileFormData>({
    full_name: "",
    headline: "",
    bio: "",
    location: "",
    phone: "",
    date_of_birth: "",
    job_title: "",
    experience_level: "",
    experience_years: 0,
    skills: [],
    education: [],
    preferred_job_types: [],
    preferred_locations: [],
    preferred_salary_range: { min: 0, max: 0, currency: "USD" },
    availability_status: "Available",
    work_authorization: "",
    remote_preference: "Hybrid",
    relocation_willingness: "Open to discussion",
    website: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
  })

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        headline: profile.headline || "",
        bio: profile.bio || "",
        location: profile.location || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "",
        job_title: profile.job_title || "",
        experience_level: profile.experience_level || "",
        experience_years: profile.experience_years || 0,
        skills: profile.skills || [],
        education: profile.education || [],
        preferred_job_types: profile.preferred_job_types || [],
        preferred_locations: profile.preferred_locations || [],
        preferred_salary_range: profile.preferred_salary_range || { min: 0, max: 0, currency: "USD" },
        availability_status: profile.availability_status || "Available",
        work_authorization: profile.work_authorization || "",
        remote_preference: profile.remote_preference || "Hybrid",
        relocation_willingness: profile.relocation_willingness || "Open to discussion",
        website: profile.website || "",
        linkedin_url: profile.linkedin_url || "",
        github_url: profile.github_url || "",
        portfolio_url: profile.portfolio_url || "",
      })
    }
  }, [profile])

  // Calculate profile completeness
  const calculateCompleteness = useCallback(() => {
    const fields = [
      formData.full_name,
      formData.location,
      formData.experience_level,
      formData.skills.length,
      formData.bio,
      formData.headline,
      formData.phone,
      formData.linkedin_url,
      formData.preferred_job_types.length,
      formData.preferred_locations.length,
      formData.preferred_salary_range.min > 0,
      formData.education.length,
    ]

    const completedFields = fields.filter((field) =>
      typeof field === "string"
        ? field.trim() !== ""
        : typeof field === "number"
          ? field > 0
          : Array.isArray(field)
            ? field.length > 0
            : field,
    ).length

    return Math.round((completedFields / fields.length) * 100)
  }, [formData])

  // Validate form
  const validateForm = useCallback((): boolean => {
    const result = profileValidator.validate(formData)
    const errorMap: Record<string, string> = {}

    result.errors.forEach((error) => {
      errorMap[error.field] = error.message
    })

    setErrors(errorMap)
    return result.isValid
  }, [formData])

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving")
      return
    }

    const supabase = createSupabaseClient()
    if (!supabase) {
      toast.error("Failed to initialize database connection")
      return
    }

    try {
      setSaving(true)
      setSuccess(false)

      // Convert form data to Profile type
      const profileData: Partial<Profile> = {
        full_name: formData.full_name,
        headline: formData.headline,
        bio: formData.bio,
        location: formData.location,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        job_title: formData.job_title,
        experience_level: formData.experience_level,
        experience_years: formData.experience_years,
        skills: formData.skills,
        education: formData.education,
        preferred_job_types: formData.preferred_job_types,
        preferred_locations: formData.preferred_locations,
        preferred_salary_range: formData.preferred_salary_range,
        availability_status: formData.availability_status as Profile["availability_status"],
        work_authorization: formData.work_authorization as Profile["work_authorization"],
        remote_preference: formData.remote_preference as Profile["remote_preference"],
        relocation_willingness: formData.relocation_willingness as Profile["relocation_willingness"],
        website: formData.website,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url,
        portfolio_url: formData.portfolio_url,
      }

      const { error } = await updateProfile(profileData)

      if (error) {
        throw error
      }

      setSuccess(true)
      toast.success("Profile updated successfully!")

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }, [formData, updateProfile, validateForm])

  // Handle field changes
  const handleFieldChange = useCallback(
    (field: keyof EnhancedProfileFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      // Clear error for this field
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }))
      }
    },
    [errors],
  )

  // Handle array field changes
  const handleArrayFieldChange = useCallback((field: keyof EnhancedProfileFormData, value: string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Handle education changes
  const handleEducationChange = useCallback((education: EducationEntry[]) => {
    setFormData((prev) => ({ ...prev, education }))
  }, [])

  // Handle salary range changes
  const handleSalaryRangeChange = useCallback((field: keyof SalaryRange, value: number | string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_salary_range: {
        ...prev.preferred_salary_range,
        [field]: value,
      },
    }))
  }, [])

  const completeness = calculateCompleteness()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Completeness */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <span className="font-medium">Profile Completeness</span>
            </div>
            <Badge variant={completeness >= 80 ? "default" : completeness >= 60 ? "secondary" : "outline"}>
              {completeness}%
            </Badge>
          </div>
          <Progress value={completeness} className="w-full" />
          <p className="text-sm text-gray-600 mt-2">
            Complete your profile to get better job matches and personalized recommendations.
          </p>
        </CardContent>
      </Card>

      {/* Success Message */}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Profile updated successfully!</AlertDescription>
        </Alert>
      )}

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please fix the following errors: {Object.values(errors).join(", ")}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="media">Media & Links</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Your personal and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleFieldChange("full_name", e.target.value)}
                    placeholder="Enter your full name"
                    className={errors.full_name ? "border-red-500" : ""}
                  />
                  {errors.full_name && <p className="text-sm text-red-600">{errors.full_name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headline">Professional Headline</Label>
                  <Input
                    id="headline"
                    value={formData.headline}
                    onChange={(e) => handleFieldChange("headline", e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleFieldChange("bio", e.target.value)}
                  placeholder="Tell us about yourself, your experience, and what you're looking for..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleFieldChange("location", e.target.value)}
                      placeholder="Washington, DC"
                      className={`pl-10 ${errors.location ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleFieldChange("date_of_birth", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Information Tab */}
        <TabsContent value="professional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Information
              </CardTitle>
              <CardDescription>Your work experience, skills, and qualifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job_title">Current/Desired Job Title</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="job_title"
                      value={formData.job_title}
                      onChange={(e) => handleFieldChange("job_title", e.target.value)}
                      placeholder="Software Engineer"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience_level">Experience Level *</Label>
                  <Select
                    value={formData.experience_level}
                    onValueChange={(value) => handleFieldChange("experience_level", value)}
                  >
                    <SelectTrigger className={errors.experience_level ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                      <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                      <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                      <SelectItem value="executive">Executive/C-Level</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.experience_level && <p className="text-sm text-red-600">{errors.experience_level}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experience_years}
                  onChange={(e) => handleFieldChange("experience_years", Number(e.target.value))}
                  placeholder="5"
                />
              </div>

              {/* Skills Selector - Simplified */}
              <div className="space-y-2">
                <Label htmlFor="skills">Skills *</Label>
                <Input
                  id="skills"
                  value={formData.skills.join(", ")}
                  onChange={(e) =>
                    handleArrayFieldChange(
                      "skills",
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    )
                  }
                  placeholder="JavaScript, React, Node.js, Python (comma-separated)"
                  className={errors.skills ? "border-red-500" : ""}
                />
                {errors.skills && <p className="text-sm text-red-600">{errors.skills}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Education - Simplified */}
              <div className="space-y-2">
                <Label>Education</Label>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="degree">Degree</Label>
                        <Input id="degree" placeholder="Bachelor of Science" />
                      </div>
                      <div>
                        <Label htmlFor="field">Field of Study</Label>
                        <Input id="field" placeholder="Computer Science" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="school">School</Label>
                        <Input id="school" placeholder="University Name" />
                      </div>
                      <div>
                        <Label htmlFor="graduation_year">Graduation Year</Label>
                        <Input id="graduation_year" type="number" placeholder="2020" />
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Job Preferences
              </CardTitle>
              <CardDescription>Your job preferences and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availability_status">Availability Status</Label>
                  <Select
                    value={formData.availability_status}
                    onValueChange={(value) => handleFieldChange("availability_status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Open to opportunities">Open to opportunities</SelectItem>
                      <SelectItem value="Not looking">Not looking</SelectItem>
                      <SelectItem value="Employed">Employed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work_authorization">Work Authorization</Label>
                  <Select
                    value={formData.work_authorization}
                    onValueChange={(value) => handleFieldChange("work_authorization", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select work authorization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US Citizen">US Citizen</SelectItem>
                      <SelectItem value="Permanent Resident">Permanent Resident</SelectItem>
                      <SelectItem value="Work Visa">Work Visa</SelectItem>
                      <SelectItem value="Student Visa">Student Visa</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="remote_preference">Remote Preference</Label>
                  <Select
                    value={formData.remote_preference}
                    onValueChange={(value) => handleFieldChange("remote_preference", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relocation_willingness">Relocation Willingness</Label>
                  <Select
                    value={formData.relocation_willingness}
                    onValueChange={(value) => handleFieldChange("relocation_willingness", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Willing to relocate">Willing to relocate</SelectItem>
                      <SelectItem value="Open to discussion">Open to discussion</SelectItem>
                      <SelectItem value="Not willing to relocate">Not willing to relocate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preferred Job Types</Label>
                <Input
                  value={formData.preferred_job_types.join(", ")}
                  onChange={(e) =>
                    handleArrayFieldChange(
                      "preferred_job_types",
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    )
                  }
                  placeholder="Full-time, Contract, Part-time (comma-separated)"
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Locations</Label>
                <Input
                  value={formData.preferred_locations.join(", ")}
                  onChange={(e) =>
                    handleArrayFieldChange(
                      "preferred_locations",
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    )
                  }
                  placeholder="New York, NY, Remote, San Francisco, CA (comma-separated)"
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Salary Range</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="salary_min">Minimum</Label>
                    <Input
                      id="salary_min"
                      type="number"
                      min="0"
                      value={formData.preferred_salary_range.min}
                      onChange={(e) => handleSalaryRangeChange("min", Number(e.target.value))}
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary_max">Maximum</Label>
                    <Input
                      id="salary_max"
                      type="number"
                      min="0"
                      value={formData.preferred_salary_range.max}
                      onChange={(e) => handleSalaryRangeChange("max", Number(e.target.value))}
                      placeholder="100000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary_currency">Currency</Label>
                    <Select
                      value={formData.preferred_salary_range.currency}
                      onChange={(e) => handleSalaryRangeChange("currency", e.target.value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media & Links Tab */}
        <TabsContent value="media" className="space-y-4">
          {/* Profile Image Upload - Simplified */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Image
              </CardTitle>
              <CardDescription>Upload a professional profile photo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || "/placeholder-user.jpg"} />
                  <AvatarFallback className="text-lg">
                    {formData.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Upload Photo
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resume Upload - Simplified */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume
              </CardTitle>
              <CardDescription>Upload your resume for better job matching</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">Drop your resume here or click to browse</p>
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX up to 10MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Links & Portfolio
              </CardTitle>
              <CardDescription>Add your professional online presence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website">Personal Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleFieldChange("website", e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleFieldChange("linkedin_url", e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub Profile</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="github_url"
                    value={formData.github_url}
                    onChange={(e) => handleFieldChange("github_url", e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio_url">Portfolio URL</Label>
                <Input
                  id="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={(e) => handleFieldChange("portfolio_url", e.target.value)}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={saving} className="bg-red-500 hover:bg-red-600">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  )
}
