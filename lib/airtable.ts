import Airtable from 'airtable'

let base: Airtable.Base;

function getAirtableBase() {
  if (!base) {
    const apiKey = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!apiKey || !baseId) {
      throw new Error('Airtable API key or Base ID are not defined in environment variables.');
    }

    base = new Airtable({ apiKey }).base(baseId);
  }
  return base;
}

const tableName = process.env.AIRTABLE_TABLE_NAME || 'Jobs'

// Types for Airtable records
export interface AirtableJobRecord {
  id: string
  fields: {
    'Job ID'?: string
    'Title': string
    'Company': string
    'Location': string
    'Job Type'?: string
    'Experience Level'?: string
    'Salary Min'?: number
    'Salary Max'?: number
    'Description'?: string
    'Requirements'?: string
    'Status'?: string
    'Posted Date'?: string
    'Expires Date'?: string
    'Created By'?: string
    'Last Sync'?: string
    'Sync Status'?: string
    'Industry'?: string
    'Department'?: string
    'Remote Friendly'?: boolean
    'Skills Required'?: string
    'Priority'?: string
  }
}

export interface SupabaseJob {
  airtable_id: string
  title: string
  company: string
  location: string
  job_type?: string
  experience_level?: string
  salary_min?: number
  salary_max?: number
  description?: string
  requirements?: string
  status: string
  posted_date?: string
  expires_date?: string
  created_by?: string
  industry?: string
  department?: string
  remote_friendly?: boolean
  skills_required?: string[]
  priority?: string
  last_sync_date: string
  sync_status: string
  data_source: string
}

// Fetch active jobs from Airtable
export async function fetchActiveJobs(): Promise<AirtableJobRecord[]> {
  const airtableBase = getAirtableBase();
  try {
    const records = await airtableBase(tableName)
      .select({
        filterByFormula: "{Status} = 'Active'",
        sort: [{ field: 'Posted Date', direction: 'desc' }]
      })
      .all()

    return records.map((record: any) => ({
      id: record.id,
      fields: record.fields as AirtableJobRecord['fields']
    }))
  } catch (error) {
    console.error('Error fetching active jobs from Airtable:', error)
    throw error
  }
}

// Fetch single job by Airtable ID
export async function fetchJobByAirtableId(airtableId: string): Promise<AirtableJobRecord | null> {
  const airtableBase = getAirtableBase();
  try {
    const records = await airtableBase(tableName)
      .select({
        filterByFormula: `RECORD_ID() = '${airtableId}'`
      })
      .all()

    if (records.length === 0) return null

    return {
      id: records[0].id,
      fields: records[0].fields as AirtableJobRecord['fields']
    }
  } catch (error) {
    console.error('Error fetching job by Airtable ID:', error)
    throw error
  }
}

// Update sync status in Airtable
export async function updateSyncStatus(airtableId: string, syncStatus: string): Promise<void> {
  const airtableBase = getAirtableBase();
  try {
    await airtableBase(tableName).update([
      {
        id: airtableId,
        fields: {
          'Last Sync': new Date().toISOString(),
          'Sync Status': syncStatus
        }
      }
    ])
  } catch (error) {
    console.error('Error updating sync status in Airtable:', error)
    throw error
  }
}

// Handle Airtable API rate limiting (5 requests/second)
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Rate-limited version of fetchActiveJobs
export async function fetchActiveJobsWithRateLimit(): Promise<AirtableJobRecord[]> {
  const jobs = await fetchActiveJobs()
  
  // Add delay to respect rate limits
  await delay(200) // 200ms delay between requests
  
  return jobs
}
