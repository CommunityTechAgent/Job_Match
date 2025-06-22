"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileForm } from "@/components/profile/profile-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SyncDashboard } from "@/components/admin/sync-dashboard"
import { LogOut, Search, FileText, Mail, BarChart3, Settings, Briefcase, Users, TrendingUp, Database } from "lucide-react"

export function Dashboard() {
  const { user, profile, signOut } = useAuth()

  const stats = [
    { label: "Job Matches", value: "12", icon: Briefcase, color: "text-blue-600" },
    { label: "Applications", value: "8", icon: Mail, color: "text-green-600" },
    { label: "Response Rate", value: "73%", icon: TrendingUp, color: "text-yellow-600" },
    { label: "Active Jobs", value: "156", icon: Database, color: "text-purple-600" },
  ]

  const recentMatches = [
    {
      title: "Senior Software Engineer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      match: "95%",
      status: "Applied"
    },
    {
      title: "Product Manager",
      company: "Innovation Labs",
      location: "New York, NY",
      match: "88%",
      status: "Pending"
    },
    {
      title: "Data Scientist",
      company: "Analytics Pro",
      location: "Austin, TX",
      match: "92%",
      status: "Interview"
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">JobMatch AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-600">Welcome, {profile?.full_name || user?.email}</span>
              <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="matches">Job Matches</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="sync">Sync Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Matches */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Job Matches</CardTitle>
                <CardDescription>Your latest AI-powered job discoveries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMatches.map((match, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{match.title}</h3>
                        <p className="text-slate-600">{match.company}</p>
                        <p className="text-sm text-slate-500">{match.location}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-semibold">{match.match} Match</div>
                        <div className="text-sm text-slate-500">{match.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle>All Job Matches</CardTitle>
                <CardDescription>Complete list of your AI-discovered opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Job matches functionality coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>

          <TabsContent value="sync">
            <SyncDashboard />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Settings functionality coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
