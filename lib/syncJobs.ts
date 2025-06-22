import { supabase } from './supabase'
import { fetchActiveJobsWithRateLimit, updateSyncStatus } from './airtable'
import { transformAirtableJobs, validateRequiredFields, jobsAreDifferent } from './jobTransformer'

export interface SyncResult {
  added: number
  updated: number
  errors: string[]
  totalProcessed: number
  syncDate: string
}

export interface SyncError {
  airtableId: string
  error: string
  jobData?: any
}

// Main sync function
export async function syncJobsFromAirtable(): Promise<SyncResult> {
  const result: SyncResult = {
    added: 0,
    updated: 0,
    errors: [],
    totalProcessed: 0,
    syncDate: new Date().toISOString()
  }

  try {
    console.log('Starting Airtable to Supabase job sync...')
    
    // Fetch active jobs from Airtable
    const airtableJobs = await fetchActiveJobsWithRateLimit()
    console.log(`Found ${airtableJobs.length} active jobs in Airtable`)
    
    // Transform Airtable records to Supabase format
    const supabaseJobs = transformAirtableJobs(airtableJobs)
    
    // Process each job
    for (const job of supabaseJobs) {
      result.totalProcessed++
      
      try {
        // Validate required fields
        const validation = validateRequiredFields(job)
        if (!validation.isValid) {
          result.errors.push(`Job ${job.airtable_id}: ${validation.errors.join(', ')}`)
          continue
        }
        
        // Check if job already exists in Supabase
        const existingJob = await getJobByAirtableId(job.airtable_id)
        
        if (!existingJob) {
          // Insert new job
          await insertJob(job)
          result.added++
          console.log(`Added new job: ${job.title} at ${job.company}`)
        } else {
          // Check if job has changed
          if (jobsAreDifferent(job, existingJob)) {
            await updateJob(job.airtable_id, job)
            result.updated++
            console.log(`Updated job: ${job.title} at ${job.company}`)
          } else {
            console.log(`No changes for job: ${job.title} at ${job.company}`)
          }
        }
        
        // Update sync status in Airtable
        await updateSyncStatus(job.airtable_id, 'synced')
        
      } catch (error) {
        const errorMessage = `Error processing job ${job.airtable_id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        result.errors.push(errorMessage)
        console.error(errorMessage)
        
        // Update sync status to error in Airtable
        try {
          await updateSyncStatus(job.airtable_id, 'error')
        } catch (updateError) {
          console.error(`Failed to update sync status for ${job.airtable_id}:`, updateError)
        }
      }
    }
    
    // Mark jobs not in Airtable as inactive
    await markInactiveJobs(airtableJobs.map(job => job.id))
    
    console.log(`Sync completed: ${result.added} added, ${result.updated} updated, ${result.errors.length} errors`)
    
  } catch (error) {
    const errorMessage = `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    result.errors.push(errorMessage)
    console.error(errorMessage)
  }
  
  return result
}

// Get job by Airtable ID
async function getJobByAirtableId(airtableId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('airtable_id', airtableId)
    .single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    throw error
  }
  
  return data
}

// Insert new job
async function insertJob(job: any) {
  const { error } = await supabase
    .from('jobs')
    .insert(job)
  
  if (error) {
    throw error
  }
}

// Update existing job
async function updateJob(airtableId: string, job: any) {
  const { error } = await supabase
    .from('jobs')
    .update(job)
    .eq('airtable_id', airtableId)
  
  if (error) {
    throw error
  }
}

// Mark jobs not in Airtable as inactive
async function markInactiveJobs(activeAirtableIds: string[]) {
  if (activeAirtableIds.length === 0) return
  
  const { error } = await supabase
    .from('jobs')
    .update({ 
      status: 'Expired',
      sync_status: 'inactive',
      last_sync_date: new Date().toISOString()
    })
    .not('airtable_id', 'in', `(${activeAirtableIds.map(id => `'${id}'`).join(',')})`)
    .eq('data_source', 'airtable')
    .eq('status', 'Active')
  
  if (error) {
    console.error('Error marking inactive jobs:', error)
  }
}

// Get sync statistics
export async function getSyncStats() {
  const { data: stats, error } = await supabase
    .from('jobs')
    .select('sync_status, status')
  
  if (error) {
    throw error
  }
  
  const counts = {
    total: stats.length,
    synced: stats.filter(job => job.sync_status === 'synced').length,
    pending: stats.filter(job => job.sync_status === 'pending').length,
    error: stats.filter(job => job.sync_status === 'error').length,
    active: stats.filter(job => job.status === 'Active').length,
    inactive: stats.filter(job => job.status !== 'Active').length
  }
  
  return counts
}

// Get last sync date
export async function getLastSyncDate(): Promise<string | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('last_sync_date')
    .order('last_sync_date', { ascending: false })
    .limit(1)
    .single()
  
  if (error) {
    console.error('Error getting last sync date:', error)
    return null
  }
  
  return data?.last_sync_date || null
} 