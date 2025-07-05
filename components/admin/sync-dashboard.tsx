"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Play, AlertCircle, CheckCircle, Clock, Database } from "lucide-react"
import { toast } from "sonner"

interface SyncStats {
  total: number
  synced: number
  pending: number
  error: number
  active: number
  inactive: number
}

interface SyncResult {
  added: number
  updated: number
  errors: string[]
  totalProcessed: number
  syncDate: string
}

export function SyncDashboard() {
  const [stats, setStats] = useState<SyncStats | null>(null)
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)

  // Fetch sync stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/jobs/sync')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
        setLastSyncDate(data.lastSyncDate)
      }
    } catch (error) {
      console.error('Failed to fetch sync stats:', error)
      toast.error('Failed to fetch sync statistics')
    }
  }

  // Manual sync
  const runManualSync = async () => {
    setIsSyncing(true)
    toast.info('Starting job sync...')
    
    try {
      const response = await fetch('/api/jobs/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
        setLastSyncDate(data.lastSyncDate)
        setLastSyncResult(data.result)
        
        const { added, updated, errors } = data.result
        toast.success(`Sync completed! Added: ${added}, Updated: ${updated}, Errors: ${errors.length}`)
        
        if (errors.length > 0) {
          toast.error(`${errors.length} errors occurred during sync`)
        }
      } else {
        toast.error(`Sync failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Manual sync failed:', error)
      toast.error('Manual sync failed')
    } finally {
      setIsSyncing(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchStats()
  }, [])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Airtable Sync Dashboard</h2>
          <p className="text-slate-600">Manage job synchronization from Airtable to Supabase</p>
        </div>
        <Button 
          onClick={runManualSync} 
          disabled={isSyncing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Manual Sync
            </>
          )}
        </Button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Jobs</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Jobs</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Synced</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.synced}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Errors</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.error}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sync Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sync Status</CardTitle>
            <CardDescription>Current synchronization status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Last Sync:</span>
              <span className="text-sm font-medium">{formatDate(lastSyncDate)}</span>
            </div>
            
            {stats && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Synced Jobs:</span>
                  <Badge className={getStatusColor('synced')}>{stats.synced}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Pending Jobs:</span>
                  <Badge className={getStatusColor('pending')}>{stats.pending}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Error Jobs:</span>
                  <Badge className={getStatusColor('error')}>{stats.error}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Sync Result */}
        {lastSyncResult && (
          <Card>
            <CardHeader>
              <CardTitle>Last Sync Result</CardTitle>
              <CardDescription>Details from the most recent sync</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Added</p>
                  <p className="text-2xl font-bold text-green-600">{lastSyncResult.added}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Updated</p>
                  <p className="text-2xl font-bold text-blue-600">{lastSyncResult.updated}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-600">Total Processed</p>
                <p className="text-lg font-semibold">{lastSyncResult.totalProcessed}</p>
              </div>
              
              {lastSyncResult.errors.length > 0 && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">Errors ({lastSyncResult.errors.length})</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {lastSyncResult.errors.slice(0, 5).map((error, index) => (
                      <p key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </p>
                    ))}
                    {lastSyncResult.errors.length > 5 && (
                      <p className="text-xs text-slate-500">
                        ... and {lastSyncResult.errors.length - 5} more errors
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common sync management tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button 
            variant="outline" 
            onClick={fetchStats}
            disabled={isSyncing}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Stats
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.open('https://airtable.com', '_blank')}
          >
            <Database className="mr-2 h-4 w-4" />
            Open Airtable
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
