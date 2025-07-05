"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Save, User, MapPin, Briefcase, Sparkles, CheckCircle } from "lucide-react"
import { ResumeUpload } from "./resume-upload"
import { Badge } from "@/components/ui/badge"

export function ProfileForm() {
  const { profile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    location: "",
    job_title: "",
    experience_level: "",
    skills: "",
  })

  // Helper: Get AI-extracted skills/confidence
  const aiSkills = Array.isArray(profile?.skills) ? profile.skills : []
  const aiConfidence = profile?.ai_extracted_skills_confidence?.skills || {}
  const aiJobTitle = profile?.ai_extracted_job_title || ""
  const aiExperienceLevel = profile?.ai_extracted_experience_level || ""

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        location: profile.location || "",
        job_title: profile.job_title || "",
        experience_level: profile.experience_level || "",
        skills: profile.skills?.join(", ") || "",
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const skillsArray = formData.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)

    const { error } = await updateProfile({
      full_name: formData.full_name,
      location: formData.location,
      job_title: formData.job_title,
      experience_level: formData.experience_level,
      skills: skillsArray,
    })

    if (!error) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }

    setLoading(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Complete your profile to get better job matches and personalized cover letters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* AI Suggestions Section */}
            {(aiJobTitle || aiExperienceLevel) && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-900">AI Suggestions</span>
                </div>
                <div className="flex flex-col gap-2">
                  {aiJobTitle && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-purple-800">Job Title Suggestion:</span>
                      <Badge variant="secondary">{aiJobTitle}</Badge>
                      <Button type="button" size="sm" variant="outline" onClick={() => handleChange("job_title", aiJobTitle)}>
                        Accept
                      </Button>
                    </div>
                  )}
                  {aiExperienceLevel && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-purple-800">Experience Level Suggestion:</span>
                      <Badge variant="secondary">{aiExperienceLevel}</Badge>
                      <Button type="button" size="sm" variant="outline" onClick={() => handleChange("experience_level", aiExperienceLevel)}>
                        Accept
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Washington, DC"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_title">Current/Desired Job Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => handleChange("job_title", e.target.value)}
                    placeholder="Software Engineer"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_level">Experience Level</Label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(value) => handleChange("experience_level", value)}
                >
                  <SelectTrigger>
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
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Textarea
                id="skills"
                value={formData.skills}
                onChange={(e) => handleChange("skills", e.target.value)}
                placeholder="JavaScript, React, Node.js, Python, AWS, etc. (comma-separated)"
                rows={3}
              />
              <p className="text-sm text-slate-500">
                Enter your skills separated by commas. This helps our AI find better job matches.
              </p>
              {/* AI-Extracted Skills Section */}
              {aiSkills.length > 0 && (
                <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-900">AI-Extracted Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiSkills.map((skill, idx) => (
                      <div key={skill} className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                        {aiConfidence[skill] !== undefined && (
                          <span className="text-xs text-purple-700">({aiConfidence[skill]}%)</span>
                        )}
                        {!formData.skills.toLowerCase().includes(skill.toLowerCase()) && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleChange("skills", formData.skills ? formData.skills + ", " + skill : skill)}
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 text-sm">Profile updated successfully!</p>
              </div>
            )}

            <Button type="submit" className="w-full bg-red-500 hover:bg-red-600" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Resume Upload Section */}
      <div className="max-w-2xl mx-auto">
        <ResumeUpload />
      </div>
    </div>
  )
}
