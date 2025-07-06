"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sparkles,
  Brain,
  Target,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  Globe,
  ArrowRight,
  Download,
  Send,
  Eye,
  MessageSquare,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  Building,
  PenTool,
  Radar,
  Bell,
  Settings,
  Plus,
  Filter,
  RefreshCw,
  ExternalLink,
  Bookmark,
  BarChart3,
  Lightbulb,
  Rocket,
  Award,
  Crown,
  Gem,
  Flame,
  CloudLightningIcon as Lightning,
  Wand2,
} from "lucide-react"

export function PremiumDashboard() {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [aiProcessing, setAiProcessing] = useState(false)

  // Premium AI Stats
  const [aiStats, setAiStats] = useState({
    jobsScanned: 15420,
    matchesFound: 47,
    coverLettersGenerated: 23,
    emailsSent: 15,
    responsesReceived: 8,
    interviewsScheduled: 3,
    aiAccuracy: 94,
    profileOptimization: 87,
    skillsExtracted: 28,
    companiesTargeted: 156,
  })

  // Premium Job Matches with AI insights
  const [premiumMatches, setPremiumMatches] = useState([
    {
      id: 1,
      title: "Senior AI Engineer",
      company: "OpenAI",
      location: "San Francisco, CA",
      salary: "$200k - $300k",
      equity: "0.1% - 0.5%",
      matchScore: 98,
      aiInsights: [
        "Perfect skill alignment with your ML background",
        "Company culture matches your preferences",
        "Salary 40% above market average",
      ],
      skills: ["Python", "TensorFlow", "PyTorch", "MLOps", "Kubernetes"],
      posted: "2 hours ago",
      status: "hot",
      remote: true,
      type: "Full-time",
      urgency: "high",
      aiGenerated: true,
    },
    {
      id: 2,
      title: "Principal Product Manager",
      company: "Stripe",
      location: "Remote",
      salary: "$180k - $250k",
      equity: "0.05% - 0.2%",
      matchScore: 95,
      aiInsights: [
        "Leadership experience aligns perfectly",
        "Fintech background is a strong match",
        "Remote-first culture fits your preferences",
      ],
      skills: ["Product Strategy", "Analytics", "SQL", "A/B Testing", "Figma"],
      posted: "4 hours ago",
      status: "trending",
      remote: true,
      type: "Full-time",
      urgency: "medium",
      aiGenerated: true,
    },
    {
      id: 3,
      title: "Staff Software Engineer",
      company: "Vercel",
      location: "New York, NY",
      salary: "$170k - $220k",
      equity: "0.1% - 0.3%",
      matchScore: 92,
      aiInsights: [
        "React expertise is highly valued",
        "Open source contributions noticed",
        "Team size matches your preference",
      ],
      skills: ["React", "Next.js", "TypeScript", "Node.js", "AWS"],
      posted: "1 day ago",
      status: "new",
      remote: false,
      type: "Full-time",
      urgency: "low",
      aiGenerated: true,
    },
  ])

  // AI-Generated Cover Letters
  const [aiCoverLetters, setAiCoverLetters] = useState([
    {
      id: 1,
      jobTitle: "Senior AI Engineer",
      company: "OpenAI",
      status: "sent",
      aiScore: 96,
      personalizedElements: 8,
      wordCount: 347,
      tone: "Professional & Enthusiastic",
      keyHighlights: ["ML Research", "Open Source", "Team Leadership"],
      generatedAt: "2024-01-15T10:30:00Z",
      sentAt: "2024-01-15T11:00:00Z",
      opens: 3,
      responseReceived: false,
    },
    {
      id: 2,
      jobTitle: "Principal Product Manager",
      company: "Stripe",
      status: "draft",
      aiScore: 94,
      personalizedElements: 12,
      wordCount: 298,
      tone: "Strategic & Data-Driven",
      keyHighlights: ["Product Strategy", "Fintech", "Growth"],
      generatedAt: "2024-01-14T16:45:00Z",
      opens: 0,
      responseReceived: false,
    },
  ])

  // AI Email Outreach
  const [aiOutreach, setAiOutreach] = useState([
    {
      id: 1,
      recipient: "Sarah Chen",
      title: "VP of Engineering",
      company: "OpenAI",
      subject: "AI Engineer with 5+ Years ML Research Experience",
      aiPersonalization: 95,
      emailType: "Direct Hiring Manager",
      status: "opened",
      sentAt: "2024-01-15T09:00:00Z",
      openedAt: "2024-01-15T14:20:00Z",
      opens: 4,
      responseReceived: false,
      aiInsights: ["High engagement - opened 4 times", "Optimal send time used"],
    },
    {
      id: 2,
      recipient: "Mike Rodriguez",
      title: "Head of Product",
      company: "Stripe",
      subject: "Product Leader - Fintech & Growth Expertise",
      aiPersonalization: 92,
      emailType: "Warm Introduction",
      status: "sent",
      sentAt: "2024-01-14T15:30:00Z",
      opens: 1,
      responseReceived: true,
      aiInsights: ["Response received within 24h", "Positive sentiment detected"],
    },
  ])

  const sidebarItems = [
    { id: "overview", label: "AI Overview", icon: Sparkles, premium: true },
    { id: "matches", label: "Smart Matches", icon: Target, badge: aiStats.matchesFound, premium: true },
    { id: "ai-tools", label: "AI Tools", icon: Brain, premium: true },
    { id: "cover-letters", label: "AI Letters", icon: PenTool, badge: aiStats.coverLettersGenerated, premium: true },
    { id: "outreach", label: "Smart Outreach", icon: Send, badge: aiStats.emailsSent, premium: true },
    { id: "analytics", label: "AI Analytics", icon: BarChart3, premium: true },
    { id: "interviews", label: "Interviews", icon: Calendar, badge: aiStats.interviewsScheduled },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const generateAICoverLetter = async (jobId: number) => {
    setAiProcessing(true)
    // Simulate AI processing
    setTimeout(() => {
      setAiProcessing(false)
      const job = premiumMatches.find((j) => j.id === jobId)
      if (job) {
        const newLetter = {
          id: aiCoverLetters.length + 1,
          jobTitle: job.title,
          company: job.company,
          status: "draft" as const,
          aiScore: Math.floor(Math.random() * 10) + 90,
          personalizedElements: Math.floor(Math.random() * 8) + 5,
          wordCount: Math.floor(Math.random() * 200) + 300,
          tone: "Professional & Enthusiastic",
          keyHighlights: job.skills.slice(0, 3),
          generatedAt: new Date().toISOString(),
          opens: 0,
          responseReceived: false,
        }
        setAiCoverLetters([...aiCoverLetters, newLetter])
      }
    }, 3000)
  }

  const sendAIEmail = async (jobId: number) => {
    setAiProcessing(true)
    setTimeout(() => {
      setAiProcessing(false)
      const job = premiumMatches.find((j) => j.id === jobId)
      if (job) {
        const newEmail = {
          id: aiOutreach.length + 1,
          recipient: "Hiring Manager",
          title: "Hiring Manager",
          company: job.company,
          subject: `${job.title} - Perfect Fit for Your Team`,
          aiPersonalization: Math.floor(Math.random() * 10) + 85,
          emailType: "Direct Hiring Manager",
          status: "sent" as const,
          sentAt: new Date().toISOString(),
          opens: 0,
          responseReceived: false,
          aiInsights: ["Optimal send time selected", "High personalization score"],
        }
        setAiOutreach([...aiOutreach, newEmail])
      }
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Premium Header */}
      <div className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    JobMatch AI Pro
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-purple-200">Premium AI Assistant</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* AI Status Indicator */}
              <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-2 rounded-full border border-green-400/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-300">AI Active</span>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/10">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  3
                </Badge>
              </Button>

              {/* User Profile */}
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Avatar className="h-10 w-10 ring-2 ring-purple-400/50">
                  <AvatarImage src={profile?.avatar_url || "/placeholder-user.jpg"} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {profile?.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">
                    {profile?.full_name || user?.email?.split("@")[0] || "User"}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Gem className="h-3 w-3 text-purple-300" />
                    <span className="text-xs text-purple-200">Pro Member</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex relative z-10">
        {/* Premium Sidebar */}
        <div className="w-80 bg-black/30 backdrop-blur-2xl border-r border-white/10 min-h-screen sticky top-20">
          <div className="p-6">
            {/* AI Performance Card */}
            <Card className="mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-300" />
                    <span className="text-sm font-medium text-white">AI Performance</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                    {aiStats.aiAccuracy}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-purple-200">
                    <span>Match Accuracy</span>
                    <span>{aiStats.aiAccuracy}%</span>
                  </div>
                  <Progress value={aiStats.aiAccuracy} className="h-2 bg-purple-900/50" />
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-300 group ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-lg border border-purple-400/30"
                      : "hover:bg-white/10 text-gray-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <item.icon className="h-5 w-5" />
                      {item.premium && (
                        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400" />
                      )}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className={`${
                        activeTab === item.id
                          ? "bg-white/20 text-white border-white/30"
                          : "bg-purple-500/20 text-purple-300 border-purple-400/30"
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>

            {/* Quick AI Actions */}
            <Card className="mt-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-white mb-3 flex items-center">
                  <Lightning className="h-4 w-4 mr-2 text-yellow-400" />
                  Quick AI Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20"
                    disabled={aiProcessing}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    {aiProcessing ? "Processing..." : "Generate Cover Letter"}
                  </Button>
                  <Button
                    size="sm"
                    className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20"
                    disabled={aiProcessing}
                  >
                    <Radar className="h-4 w-4 mr-2" />
                    Find New Matches
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* AI Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Hero Stats */}
              <Card className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 border-purple-400/30 backdrop-blur-xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <Avatar className="h-24 w-24 ring-4 ring-purple-400/50 shadow-2xl">
                          <AvatarImage src={profile?.avatar_url || "/placeholder-user.jpg"} />
                          <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            {profile?.full_name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-white">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold text-white mb-2">
                          Welcome back, {profile?.full_name || user?.email?.split("@")[0] || "User"}! 🚀
                        </h2>
                        <p className="text-purple-200 text-lg mb-4">
                          Your AI assistant has been working around the clock
                        </p>
                        <div className="flex items-center space-x-6 text-purple-200">
                          <div className="flex items-center space-x-2">
                            <Radar className="h-5 w-5 text-green-400" />
                            <span>{aiStats.jobsScanned.toLocaleString()} jobs scanned today</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="h-5 w-5 text-blue-400" />
                            <span>{aiStats.matchesFound} perfect matches found</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-3 mb-4">
                        <Crown className="h-8 w-8 text-yellow-400" />
                        <div>
                          <div className="text-2xl font-bold text-white">Pro Member</div>
                          <div className="text-purple-200">Unlimited AI Power</div>
                        </div>
                      </div>
                      <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold hover:from-yellow-500 hover:to-orange-600">
                        <Rocket className="h-4 w-4 mr-2" />
                        Boost Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Performance Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {[
                  {
                    label: "Jobs Scanned",
                    value: aiStats.jobsScanned.toLocaleString(),
                    icon: Radar,
                    color: "from-blue-500 to-cyan-500",
                    change: "+2.3k today",
                  },
                  {
                    label: "AI Matches",
                    value: aiStats.matchesFound,
                    icon: Target,
                    color: "from-green-500 to-emerald-500",
                    change: "+12 new",
                  },
                  {
                    label: "Smart Letters",
                    value: aiStats.coverLettersGenerated,
                    icon: PenTool,
                    color: "from-purple-500 to-pink-500",
                    change: "+5 today",
                  },
                  {
                    label: "AI Emails",
                    value: aiStats.emailsSent,
                    icon: Send,
                    color: "from-orange-500 to-red-500",
                    change: "+3 sent",
                  },
                  {
                    label: "Responses",
                    value: aiStats.responsesReceived,
                    icon: MessageSquare,
                    color: "from-pink-500 to-rose-500",
                    change: "+2 today",
                  },
                  {
                    label: "Interviews",
                    value: aiStats.interviewsScheduled,
                    icon: Calendar,
                    color: "from-indigo-500 to-purple-500",
                    change: "+1 scheduled",
                  },
                ].map((stat, index) => (
                  <Card
                    key={index}
                    className="bg-black/30 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                  >
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-400 mb-2">{stat.label}</div>
                      <div className="text-xs text-green-400">{stat.change}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* AI Insights & Top Matches */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Insights */}
                <Card className="bg-black/30 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Brain className="h-6 w-6 mr-3 text-purple-400" />
                      AI Insights
                      <Badge className="ml-3 bg-purple-500/20 text-purple-300 border-purple-400/30">
                        Live
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        insight: "Your React skills are in high demand - 156 new jobs this week",
                        confidence: 94,
                        icon: TrendingUp,
                        color: "text-green-400",
                      },
                      {
                        insight: "AI suggests adding 'TypeScript' to boost matches by 23%",
                        confidence: 87,
                        icon: Lightbulb,
                        color: "text-yellow-400",
                      },
                      {
                        insight: "Best time to apply: Tuesday 10-11 AM (67% higher response rate)",
                        confidence: 91,
                        icon: Clock,
                        color: "text-blue-400",
                      },
                      {
                        insight: "Your profile views increased 340% after AI optimization",
                        confidence: 96,
                        icon: Eye,
                        color: "text-purple-400",
                      },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex-shrink-0">
                          <div className="p-2 bg-black/30 rounded-full">
                            <item.icon className={`h-4 w-4 ${item.color}`} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white mb-2">{item.insight}</p>
                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-gray-400">Confidence:</div>
                            <Progress value={item.confidence} className="w-20 h-2" />
                            <div className="text-xs text-gray-300">{item.confidence}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Premium Job Matches */}
                <Card className="bg-black/30 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <span className="flex items-center">
                        <Flame className="h-6 w-6 mr-3 text-orange-400" />
                        Hot Matches
                      </span>
                      <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white">
                        View All
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {premiumMatches.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        className="p-4 rounded-lg bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-white">{job.title}</h4>
                              <Badge
                                className={`${
                                  job.matchScore >= 95
                                    ? "bg-green-500/20 text-green-300 border-green-400/30"
                                    : "bg-blue-500/20 text-blue-300 border-blue-400/30"
                                }`}
                              >
                                {job.matchScore}% Match
                              </Badge>
                              {job.status === "hot" && (
                                <Badge className="bg-red-500/20 text-red-300 border-red-400/30 animate-pulse">
                                  <Flame className="h-3 w-3 mr-1" />
                                  Hot
                                </Badge>
                              )}
                            </div>
                            <p className="text-purple-200 mb-2">{job.company}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                              <span>{job.location}</span>
                              <span>{job.salary}</span>
                              {job.equity && <span>{job.equity} equity</span>}
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {job.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-purple-500/10 text-purple-300 border-purple-400/30">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                            {job.aiInsights && (
                              <div className="text-xs text-green-300 mb-2">
                                <Sparkles className="h-3 w-3 inline mr-1" />
                                {job.aiInsights[0]}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{job.posted}</span>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs bg-transparent border-purple-400/30 text-purple-300 hover:bg-purple-500/20"
                              onClick={() => generateAICoverLetter(job.id)}
                              disabled={aiProcessing}
                            >
                              <Wand2 className="h-3 w-3 mr-1" />
                              AI Letter
                            </Button>
                            <Button
                              size="sm"
                              className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                              onClick={() => sendAIEmail(job.id)}
                              disabled={aiProcessing}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Smart Apply
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Smart Matches Tab */}
          {activeTab === "matches" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center">
                    <Target className="h-8 w-8 mr-3 text-green-400" />
                    AI-Powered Job Matches
                  </h2>
                  <p className="text-purple-200 mt-2">Personalized matches from 500+ premium sources</p>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Filter className="h-4 w-4 mr-2" />
                    Smart Filter
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    AI Refresh
                  </Button>
                </div>
              </div>

              <div className="grid gap-6">
                {premiumMatches.map((job) => (
                  <Card
                    key={job.id}
                    className="bg-black/30 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-2xl font-semibold text-white">{job.title}</h3>
                            <Badge
                              className={`${
                                job.matchScore >= 95
                                  ? "bg-green-500/20 text-green-300 border-green-400/30"
                                  : job.matchScore >= 90
                                    ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                                    : "bg-purple-500/20 text-purple-300 border-purple-400/30"
                              }`}
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              {job.matchScore}% AI Match
                            </Badge>
                            {job.status === "hot" && (
                              <Badge className="bg-red-500/20 text-red-300 border-red-400/30 animate-pulse">
                                <Flame className="h-3 w-3 mr-1" />
                                Hot Job
                              </Badge>
                            )}
                            {job.remote && (
                              <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                                <Globe className="h-3 w-3 mr-1" />
                                Remote
                              </Badge>
                            )}
                          </div>
                          <p className="text-xl text-purple-200 font-medium mb-3">{job.company}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4">
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {job.salary}
                            </span>
                            {job.equity && (
                              <span className="flex items-center">
                                <Award className="h-4 w-4 mr-1" />
                                {job.equity}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              {job.type}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {job.posted}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mb-4">
                            {job.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-400/30">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          {job.aiInsights && (
                            <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4 mb-4">
                              <h4 className="text-sm font-medium text-purple-300 mb-2 flex items-center">
                                <Brain className="h-4 w-4 mr-2" />
                                AI Insights
                              </h4>
                              <ul className="space-y-1">
                                {job.aiInsights.map((insight, index) => (
                                  <li key={index} className="text-sm text-purple-200 flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-2 text-green-400" />
                                    {insight}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2 ml-6">
                          <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                            <Bookmark className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Job
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              job.status === "hot"
                                ? "bg-red-500 animate-pulse"
                                : job.status === "trending"
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                            }`}
                          />
                          <span className="text-sm text-gray-400 capitalize">{job.status}</span>
                          {job.urgency === "high" && (
                            <Badge className="bg-red-500/20 text-red-300 border-red-400/30 text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="bg-transparent border-purple-400/30 text-purple-300 hover:bg-purple-500/20"
                            onClick={() => generateAICoverLetter(job.id)}
                            disabled={aiProcessing}
                          >
                            <Wand2 className="h-4 w-4 mr-2" />
                            {aiProcessing ? "Generating..." : "AI Cover Letter"}
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            onClick={() => sendAIEmail(job.id)}
                            disabled={aiProcessing}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {aiProcessing ? "Sending..." : "Smart Apply"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* AI Tools Tab */}
          {activeTab === "ai-tools" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                  <Brain className="h-8 w-8 mr-3 text-purple-400" />
                  AI-Powered Tools
                </h2>
                <p className="text-purple-200">Advanced AI tools to supercharge your job search</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Resume Optimizer",
                    description: "AI analyzes and optimizes your resume for ATS systems",
                    icon: FileText,
                    color: "from-blue-500 to-cyan-500",
                    features: ["ATS Optimization", "Keyword Enhancement", "Format Improvement"],
                    status: "Ready",
                  },
                  {
                    title: "Cover Letter Generator",
                    description: "Generate personalized cover letters in seconds",
                    icon: PenTool,
                    color: "from-purple-500 to-pink-500",
                    features: ["Personalization", "Company Research", "Tone Matching"],
                    status: "Active",
                  },
                  {
                    title: "Interview Prep AI",
                    description: "Practice interviews with AI-powered mock sessions",
                    icon: MessageSquare,
                    color: "from-green-500 to-emerald-500",
                    features: ["Mock Interviews", "Answer Analysis", "Confidence Building"],
                    status: "Coming Soon",
                  },
                  {
                    title: "Salary Negotiator",
                    description: "AI-powered salary negotiation strategies",
                    icon: DollarSign,
                    color: "from-yellow-500 to-orange-500",
                    features: ["Market Analysis", "Negotiation Scripts", "Counter Offers"],
                    status: "Beta",
                  },
                  {
                    title: "Network Builder",
                    description: "Find and connect with industry professionals",
                    icon: Users,
                    color: "from-pink-500 to-rose-500",
                    features: ["Contact Discovery", "Message Templates", "Follow-up Automation"],
                    status: "Ready",
                  },
                  {
                    title: "Career Path AI",
                    description: "Discover optimal career progression paths",
                    icon: TrendingUp,
                    color: "from-indigo-500 to-purple-500",
                    features: ["Path Analysis", "Skill Gaps", "Timeline Planning"],
                    status: "Ready",
                  },
                ].map((tool, index) => (
                  <Card
                    key={index}
                    className="bg-black/30 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${tool.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                        <tool.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{tool.title}</h3>
                        <Badge
                          className={`${
                            tool.status === "Ready"
                              ? "bg-green-500/20 text-green-300 border-green-400/30"
                              : tool.status === "Active"
                                ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                                : tool.status === "Beta"
                                  ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                                  : "bg-gray-500/20 text-gray-300 border-gray-400/30"
                          }`}
                        >
                          {tool.status}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-4">{tool.description}</p>
                      <div className="space-y-2 mb-4">
                        {tool.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-xs text-gray-300">
                            <CheckCircle className="h-3 w-3 mr-2 text-green-400" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <Button
                        className={`w-full ${
                          tool.status === "Coming Soon"
                            ? "bg-gray-600 cursor-not-allowed"
                            : `bg-gradient-to-r ${tool.color} hover:opacity-90`
                        }`}
                        disabled={tool.status === "Coming Soon"}
                      >
                        {tool.status === "Coming Soon" ? "Coming Soon" : "Launch Tool"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* AI Cover Letters Tab */}
          {activeTab === "cover-letters" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center">
                    <PenTool className="h-8 w-8 mr-3 text-purple-400" />
                    AI Cover Letters
                  </h2>
                  <p className="text-purple-200 mt-2">Personalized cover letters generated by advanced AI</p>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate New Letter
                </Button>
              </div>

              <div className="grid gap-6">
                {aiCoverLetters.map((letter) => (
                  <Card key={letter.id} className="bg-black/30 backdrop-blur-xl border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">{letter.jobTitle}</h3>
                            <Badge
                              className={`${
                                letter.aiScore >= 95
                                  ? "bg-green-500/20 text-green-300 border-green-400/30"
                                  : "bg-blue-500/20 text-blue-300 border-blue-400/30"
                              }`}
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              {letter.aiScore}% AI Score
                            </Badge>
                            <Badge
                              variant={letter.status === "sent" ? "default" : "secondary"}
                              className={
                                letter.status === "sent"
                                  ? "bg-green-500/20 text-green-300 border-green-400/30"
                                  : "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                              }
                            >
                              {letter.status === "sent" ? "Sent" : "Draft"}
                            </Badge>
                          </div>
                          <p className="text-purple-200 mb-2">{letter.company}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4">
                            <span>{letter.wordCount} words</span>
                            <span>{letter.personalizedElements} personalized elements</span>
                            <span>Tone: {letter.tone}</span>
                            {letter.status === "sent" && <span>{letter.opens} opens</span>}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {letter.keyHighlights.map((highlight, index) => (
                              <Badge key={index} variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-400/30">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                          {letter.status === "sent" && letter.responseReceived && (
                            <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-3 mb-4">
                              <div className="flex items-center text-green-300">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Response received from hiring manager
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                        <span>Generated: {new Date(letter.generatedAt).toLocaleDateString()}</span>
                        {letter.sentAt && <span>Sent: {new Date(letter.sentAt).toLocaleDateString()}</span>}
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        {letter.status === "draft" && (
                          <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
                            <Send className="h-4 w-4 mr-2" />
                            Send Letter
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Smart Outreach Tab */}
          {activeTab === "outreach" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center">
                    <Send className="h-8 w-8 mr-3 text-blue-400" />
                    Smart Email Outreach
                  </h2>
                  <p className="text-purple-200 mt-2">AI-powered direct outreach to hiring managers</p>
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Compose Smart Email
                </Button>
              </div>

              <div className="grid gap-6">
                {aiOutreach.map((email) => (
                  <Card key={email.id} className="bg-black/30 backdrop-blur-xl border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">{email.subject}</h3>
                            <Badge
                              className={`${
                                email.aiPersonalization >= 90
                                  ? "bg-green-500/20 text-green-300 border-green-400/30"
                                  : "bg-blue-500/20 text-blue-300 border-blue-400/30"
                              }`}
                            >
                              <Brain className="h-3 w-3 mr-1" />
                              {email.aiPersonalization}% Personalized
                            </Badge>
                            <Badge
                              className={
                                email.status === "opened"
                                  ? "bg-green-500/20 text-green-300 border-green-400/30"
                                  : "bg-blue-500/20 text-blue-300 border-blue-400/30"
                              }
                            >
                              {email.status === "opened" ? (
                                <>
                                  <Eye className="h-3 w-3 mr-1" />
                                  Opened
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Sent
                                </>
                              )}
                            </Badge>
                            {email.responseReceived && (
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Response
                              </Badge>
                            )}
                          </div>
                          <div className="text-purple-200 mb-2">
                            To: {email.recipient} ({email.title})
                          </div>
                          <div className="text-purple-200 mb-4">{email.company}</div>
                          <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4">
                            <span>Type: {email.emailType}</span>
                            <span>Opens: {email.opens}</span>
                            <span>Sent: {new Date(email.sentAt).toLocaleDateString()}</span>
                            {email.openedAt && <span>Last opened: {new Date(email.openedAt).toLocaleDateString()}</span>}
                          </div>
                          {email.aiInsights && (
                            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3 mb-4">
                              <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center">
                                <Lightbulb className="h-4 w-4 mr-2" />
                                AI Insights
                              </h4>
                              <ul className="space-y-1">
                                {email.aiInsights.map((insight, index) => (
                                  <li key={index} className="text-sm text-blue-200 flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-2 text-green-400" />
                                    {insight}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {email.responseReceived && (
                            <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-3 mb-4">
                              <div className="flex items-center text-green-300">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Positive response received - interview interest expressed
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                          <Eye className="h-4 w-4 mr-2" />
                          View Email
                        </Button>
                        {!email.responseReceived && (
                          <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            AI Follow-up
                          </Button>
                        )}
                        {email.responseReceived && (
                          <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Interview
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* AI Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                  <BarChart3 className="h-8 w-8 mr-3 text-cyan-400" />
                  AI Analytics Dashboard
                </h2>
                <p className="text-purple-200">Deep insights powered by artificial intelligence</p>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "AI Match Accuracy",
                    value: `${aiStats.aiAccuracy}%`,
                    change: "+2.3%",
                    icon: Target,
                    color: "from-green-500 to-emerald-500",
                  },
                  {
                    title: "Response Rate",
                    value: `${Math.round((aiStats.responsesReceived / aiStats.emailsSent) * 100)}%`,
                    change: "+8.1%",
                    icon: TrendingUp,
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    title: "Interview Conversion",
                    value: `${Math.round((aiStats.interviewsScheduled / aiStats.emailsSent) * 100)}%`,
                    change: "+12.5%",
                    icon: Calendar,
                    color: "from-purple-500 to-pink-500",
                  },
                  {
                    title: "Profile Optimization",
                    value: `${aiStats.profileOptimization}%`,
                    change: "+5.2%",
                    icon: User,
                    color: "from-orange-500 to-red-500",
                  },
                ].map((metric, index) => (
                  <Card key={index} className="bg-black/30 backdrop-blur-xl border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-2xl flex items-center justify-center`}>
                          <metric.icon className="h-6 w-6 text-white" />
                        </div>
                        <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                          {metric.change}
                        </Badge>
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
                      <div className="text-sm text-gray-400">{metric.title}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* AI Insights Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-black/30 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="\
