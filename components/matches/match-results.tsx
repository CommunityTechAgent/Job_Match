"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Briefcase, MapPin, Calendar, DollarSign, Star, Filter, 
  RefreshCw, ExternalLink, Building, Users, Target, TrendingUp,
  CheckCircle, AlertCircle, Clock, Zap
} from "lucide-react"
import { toast } from "sonner"
import type { JobMatch } from "@/lib/matchingAlgorithm"

interface MatchResultsProps {
  initialMatches?: JobMatch[]
  showFilters?: boolean
  showStats?: boolean
  limit?: number
}

export function MatchResults({ 
  initialMatches, 
  showFilters = true, 
  showStats = true, 
  limit = 10 
}: MatchResultsProps) {
  const { user } = useAuth()
  const [matches, setMatches] = useState<JobMatch[]>(initialMatches || [])
  const [matchStats, setMatchStats] = useState<{
    totalJobs: number
    highMatches: number
    averageScore: number
    topSkills: string[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    minScore: 0,
    location: '',
    jobType: '',
    experienceLevel: '',
    remoteOnly: false,
    limit
  })

  // Load matches
  const loadMatches = useCallback(async (useFilters = false) => {
    if (!user) return

    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (useFilters) {
        if (filters.search) params.append('search', filters.search)
        if (filters.minScore > 0) params.append('minScore', filters.minScore.toString())
        if (filters.location) params.append('location', filters.location)
        if (filters.jobType) params.append('jobType', filters.jobType)
        if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel)
        if (filters.remoteOnly) params.append('remoteOnly', 'true')
        if (filters.limit) params.append('limit', filters.limit.toString())
      }

      const response = await fetch(`/api/matches?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        if (data.data.matches) {
          setMatches(data.data.matches)
          setMatchStats(data.data.matchStats)
        } else {
          setMatches(data.data)
        }
      } else {
        toast.error(`Failed to load matches: ${data.error}`)
      }
    } catch (error) {
      console.error('Error loading matches:', error)
      toast.error('Failed to load job matches')
    } finally {
      setLoading(false)
    }
  }, [user, filters])

  // Load match statistics
  const loadStats = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch('/api/matches?type=statistics')
      const data = await response.json()

      if (data.success) {
        setMatchStats(data.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }, [user])

  // Load initial data
  useEffect(() => {
    if (!initialMatches) {
      loadMatches()
      if (showStats) {
        loadStats()
      }
    }
  }, [user, initialMatches, showStats, loadMatches, loadStats])

  // Apply filters
  const applyFilters = () => {
    loadMatches(true)
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      minScore: 0,
      location: '',
      jobType: '',
      experienceLevel: '',
      remoteOnly: false,
      limit
    })
    loadMatches()
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  // Get score icon
  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4" />
    if (score >= 60) return <TrendingUp className="h-4 w-4" />
    if (score >= 40) return <Clock className="h-4 w-4" />
    return <AlertCircle className="h-4 w-4" />
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Job Matches</h2>
          <p className="text-slate-600">Find your perfect job opportunities</p>
        </div>
        <Button 
          onClick={() => loadMatches(true)} 
          disabled={loading}
          variant="outline"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Statistics */}
      {showStats && matchStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-slate-900">{matchStats.totalJobs}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">High Matches</p>
                  <p className="text-2xl font-bold text-green-600">{matchStats.highMatches}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Average Score</p>
                  <p className="text-2xl font-bold text-blue-600">{matchStats.averageScore}%</p>
                </div>
                <Star className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Top Skills</p>
                  <p className="text-sm font-bold text-slate-900">
                    {matchStats.topSkills?.slice(0, 2).join(', ') || 'None'}
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>
              Refine your job matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Jobs</Label>
                <Input
                  id="search"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search by title, company, skills..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minScore">Minimum Score</Label>
                <Input
                  id="minScore"
                  type="number"
                  min="0"
                  max="100"
                  value={filters.minScore}
                  onChange={(e) => setFilters(prev => ({ ...prev, minScore: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., New York"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type</Label>
                <Select
                  value={filters.jobType || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, jobType: value === 'all' ? '' : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select
                  value={filters.experienceLevel || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, experienceLevel: value === 'all' ? '' : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="lead">Lead/Principal</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remoteOnly"
                  checked={filters.remoteOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, remoteOnly: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="remoteOnly">Remote only</Label>
              </div>

              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
                <Button onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading job matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-600">
                Try adjusting your filters or updating your profile to get better matches.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 mb-1">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              <span>{job.company}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(job.posted_date)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Match Score */}
                        <div className="text-right">
                          <Badge className={`${getScoreColor(job.match_score)} flex items-center gap-1`}>
                            {getScoreIcon(job.match_score)}
                            {job.match_score}% Match
                          </Badge>
                          <div className="mt-2 w-16">
                            <Progress value={job.match_score} className="h-2" />
                          </div>
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">{job.job_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">{job.experience_level}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">{job.salary_range}</span>
                        </div>
                      </div>

                      {/* Description */}
                      {job.description && (
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {job.description}
                        </p>
                      )}

                      {/* Match Reasons */}
                      {job.match_reasons.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Why this matches:</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.match_reasons.slice(0, 3).map((reason, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {reason}
                              </Badge>
                            ))}
                            {job.match_reasons.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.match_reasons.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Matching Skills */}
                      {job.matching_skills.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-slate-700 mb-2">
                            Matching Skills ({job.skills_overlap_percentage.toFixed(0)}% overlap):
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {job.matching_skills.map((skill, index) => (
                              <Badge key={index} variant="default" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      {job.remote_friendly && (
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Remote
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Save Job
                      </Button>
                      <Button size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 