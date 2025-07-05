"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Settings,
  FileText,
  Search,
  Bell,
  BarChart3,
  Calendar,
  MapPin,
  Briefcase,
  Star,
  Eye,
  Download,
  Mail,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  Filter,
  BookOpen,
  DollarSign,
} from "lucide-react"
import { EnhancedProfileForm } from "@/components/profile/enhanced-profile-form"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate profile completeness
  const calculateCompleteness = () => {
    if (!profile) return 0
    const fields = [
      profile.full_name,
      profile.location,
      profile.experience_level,
      profile.skills?.length,
      profile.bio,
      profile.headline,
      profile.phone,
      profile.linkedin_url,
      profile.preferred_job_types?.length,
      profile.preferred_locations?.length,
      profile.preferred_salary_range?.min > 0,
      profile.education?.length,
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
  }

  const completeness = calculateCompleteness()

  // Mock data for demonstration
  const mockStats = {
    jobMatches: 24,
    applications: 8,
    interviews: 3,
    profileViews: 156,
  }

  const mockRecentMatches = [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      matchScore: 92,
      salary: "$120k - $160k",
      posted: "2 days ago",
    },
    {
      id: 2,
      title: "Full Stack Developer",
      company: "StartupXYZ",
      location: "Remote",
      matchScore: 88,
      salary: "$100k - $140k",
      posted: "1 week ago",
    },
    {
      id: 3,
      title: "Frontend Engineer",
      company: "Design Co.",
      location: "New York, NY",
      matchScore: 85,
      salary: "$90k - $130k",
      posted: "3 days ago",
    },
  ]

  const mockRecentActivity = [
    { id: 1, action: "Applied to Senior Developer at TechStart", time: "2 hours ago", type: "application" },
    { id: 2, action: "Profile viewed by Google recruiter", time: "1 day ago", type: "view" },
    { id: 3, action: "New job match: React Developer", time: "2 days ago", type: "match" },
    { id: 4, action: "Interview scheduled with Microsoft", time: "3 days ago", type: "interview" },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">JobMatch AI</h1>
                <Badge variant="secondary">Dashboard</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Avatar>
                  <AvatarImage src={profile?.avatar_url || "/placeholder-user.jpg"} />
                  <AvatarFallback>
                    {profile?.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="matches" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Job Matches
              </TabsTrigger>
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Applications
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Welcome Section */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={profile?.avatar_url || "/placeholder-user.jpg"} />
                        <AvatarFallback className="text-lg">
                          {profile?.full_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Welcome back, {profile?.full_name || user?.email?.split("@")[0] || "User"}!
                        </h2>
                        <p className="text-gray-600">{profile?.headline || "Complete your profile to get started"}</p>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                          {profile?.location && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {profile.location}
                            </div>
                          )}
                          {profile?.experience_level && (
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-1" />
                              {profile.experience_level} Level
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="h-5 w-5 text-amber-500" />
                        <span className="font-medium">Profile Completeness</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={completeness} className="w-32" />
                        <Badge variant={completeness >= 80 ? "default" : completeness >= 60 ? "secondary" : "outline"}>
                          {completeness}%
                        </Badge>
                      </div>
                      {completeness < 80 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 bg-transparent"
                          onClick={() => setActiveTab("profile")}
                        >
                          Complete Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Job Matches</p>
                        <p className="text-3xl font-bold text-blue-600">{mockStats.jobMatches}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Target className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500">+12%</span>
                      <span className="text-gray-500 ml-1">from last week</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Applications</p>
                        <p className="text-3xl font-bold text-green-600">{mockStats.applications}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <FileText className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-gray-500">3 pending responses</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Interviews</p>
                        <p className="text-3xl font-bold text-purple-600">{mockStats.interviews}</p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500">1 scheduled this week</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Profile Views</p>
                        <p className="text-3xl font-bold text-orange-600">{mockStats.profileViews}</p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-full">
                        <Eye className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500">+8%</span>
                      <span className="text-gray-500 ml-1">from last month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Matches and Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Job Matches */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Recent Job Matches</span>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("matches")}>
                        View All
                      </Button>
                    </CardTitle>
                    <CardDescription>Jobs that match your profile and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockRecentMatches.map((match) => (
                      <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{match.title}</h4>
                          <p className="text-sm text-gray-600">{match.company}</p>
                          <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {match.location}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {match.salary}
                            </span>
                            <span>{match.posted}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              match.matchScore >= 90 ? "default" : match.matchScore >= 80 ? "secondary" : "outline"
                            }
                          >
                            {match.matchScore}% Match
                          </Badge>
                          <div className="mt-2 space-x-2">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                            <Button size="sm">Apply</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest job search activities</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockRecentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {activity.type === "application" && (
                            <div className="p-2 bg-blue-100 rounded-full">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                          )}
                          {activity.type === "view" && (
                            <div className="p-2 bg-green-100 rounded-full">
                              <Eye className="h-4 w-4 text-green-600" />
                            </div>
                          )}
                          {activity.type === "match" && (
                            <div className="p-2 bg-purple-100 rounded-full">
                              <Target className="h-4 w-4 text-purple-600" />
                            </div>
                          )}
                          {activity.type === "interview" && (
                            <div className="p-2 bg-orange-100 rounded-full">
                              <Calendar className="h-4 w-4 text-orange-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Management</CardTitle>
                  <CardDescription>
                    Complete your profile to get better job matches and increase your visibility to employers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EnhancedProfileForm />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Job Matches Tab */}
            <TabsContent value="matches" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Job Matches</span>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Preferences
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>Jobs that match your skills, experience, and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRecentMatches.map((match) => (
                      <div key={match.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{match.title}</h3>
                              <Badge
                                variant={
                                  match.matchScore >= 90 ? "default" : match.matchScore >= 80 ? "secondary" : "outline"
                                }
                              >
                                {match.matchScore}% Match
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{match.company}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {match.location}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {match.salary}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {match.posted}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">
                              We're looking for a talented software engineer to join our growing team. You'll work on
                              cutting-edge projects using modern technologies...
                            </p>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <Button size="sm">Apply Now</Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Star className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Applications Tab */}
            <TabsContent value="applications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Applications</CardTitle>
                  <CardDescription>Track your job applications and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Senior Software Engineer at TechCorp</h4>
                        <Badge variant="secondary">Under Review</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Applied 3 days ago</p>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          View Application
                        </Button>
                        <Button size="sm" variant="ghost">
                          Withdraw
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Full Stack Developer at StartupXYZ</h4>
                        <Badge>Interview Scheduled</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Applied 1 week ago • Interview on Dec 15</p>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Add to Calendar
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Frontend Engineer at Design Co.</h4>
                        <Badge variant="outline">Application Sent</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Applied 2 weeks ago</p>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          Follow Up
                        </Button>
                        <Button size="sm" variant="ghost">
                          View Application
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage how you receive updates about job matches and applications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive job matches via email</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-gray-600">Get instant updates on your device</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Summary</p>
                        <p className="text-sm text-gray-600">Weekly digest of your job search activity</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Subscribe
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Control your profile visibility and data sharing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Profile Visibility</p>
                        <p className="text-sm text-gray-600">Make your profile visible to recruiters</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Public
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Resume Download</p>
                        <p className="text-sm text-gray-600">Allow employers to download your resume</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Allowed
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Contact Information</p>
                        <p className="text-sm text-gray-600">Share contact details with interested employers</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Selective
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account and subscription</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Change Password</p>
                        <p className="text-sm text-gray-600">Update your account password</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Export Data</p>
                        <p className="text-sm text-gray-600">Download your profile and application data</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm text-gray-600">Permanently delete your account and data</p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Support & Help</CardTitle>
                    <CardDescription>Get help and contact support</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Help Center</p>
                        <p className="text-sm text-gray-600">Browse frequently asked questions</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Contact Support</p>
                        <p className="text-sm text-gray-600">Get help from our support team</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Feature Requests</p>
                        <p className="text-sm text-gray-600">Suggest new features or improvements</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Suggest
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
