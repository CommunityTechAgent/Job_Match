import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const browserAiData = await request.json()
    
    // Validate the request
    if (!browserAiData || !Array.isArray(browserAiData)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of job data.' },
        { status: 400 }
      )
    }

    const airtableToken = (globalThis as any)?.process?.env?.AIRTABLE_TOKEN
    const airtableBaseId = (globalThis as any)?.process?.env?.AIRTABLE_BASE_ID
    const airtableTableName = (globalThis as any)?.process?.env?.AIRTABLE_TABLE_NAME || 'Jobs'

    if (!airtableToken || !airtableBaseId) {
      return NextResponse.json(
        { error: 'Missing Airtable configuration (AIRTABLE_TOKEN, AIRTABLE_BASE_ID)' },
        { status: 500 }
      )
    }

    const results = []
    const errors = []

    // Process each job from browser AI
    for (const jobData of browserAiData) {
      try {
        // Transform browser AI data to Airtable format
        const airtableRecord = transformToAirtableFormat(jobData)
        
        // Create record in Airtable
        const response = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/${airtableTableName}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${airtableToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            records: [airtableRecord]
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          errors.push({
            job: jobData.title || jobData.job_title || 'Unknown Job',
            error: `Airtable API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
          })
        } else {
          const result = await response.json()
          results.push({
            job: jobData.title || jobData.job_title || 'Unknown Job',
            airtableId: result.records[0]?.id,
            status: 'success'
          })
        }

        // Rate limiting - wait 200ms between requests to avoid hitting Airtable limits
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (error) {
        errors.push({
          job: jobData.title || jobData.job_title || 'Unknown Job',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: browserAiData.length,
        successful: results.length,
        failed: errors.length
      },
      results,
      errors
    })

  } catch (error) {
    console.error('Browser AI to Airtable error:', error)
    return NextResponse.json(
      { error: 'Failed to process browser AI data' },
      { status: 500 }
    )
  }
}

// Transform browser AI job data to Airtable format
function transformToAirtableFormat(jobData: any) {
  return {
    fields: {
      // Map common job fields
      'Job Title': jobData.title || jobData.job_title || jobData.position || '',
      'Company': jobData.company || jobData.company_name || jobData.employer || '',
      'Location': jobData.location || jobData.city || jobData.place || '',
      'Description': jobData.description || jobData.job_description || jobData.summary || '',
      'Requirements': jobData.requirements || jobData.qualifications || jobData.skills || '',
      'Salary': jobData.salary || jobData.salary_range || jobData.compensation || '',
      'Job Type': jobData.job_type || jobData.employment_type || jobData.type || 'Full-time',
      'Experience Level': jobData.experience_level || jobData.level || jobData.seniority || '',
      'Remote Friendly': jobData.remote_friendly || jobData.remote || jobData.work_from_home || false,
      'Posted Date': jobData.posted_date || jobData.date_posted || jobData.created_at || new Date().toISOString(),
      'Job URL': jobData.url || jobData.job_url || jobData.link || '',
      'Source': 'Browser AI',
      'Status': 'Active',
      'Data Source': 'browser_ai',
      'Sync Status': 'synced',
      'Last Sync Date': new Date().toISOString(),
      
      // Additional fields that might be present
      'Benefits': jobData.benefits || '',
      'Industry': jobData.industry || jobData.sector || '',
      'Department': jobData.department || jobData.team || '',
      'Contact Email': jobData.contact_email || jobData.email || '',
      'Contact Phone': jobData.contact_phone || jobData.phone || '',
      
      // Custom fields from browser AI
      'Browser AI Data': JSON.stringify(jobData)
    }
  }
}

// GET method to check configuration
export async function GET() {
  const airtableToken = (globalThis as any)?.process?.env?.AIRTABLE_TOKEN
  const airtableBaseId = (globalThis as any)?.process?.env?.AIRTABLE_BASE_ID
  const airtableTableName = (globalThis as any)?.process?.env?.AIRTABLE_TABLE_NAME || 'Jobs'

  return NextResponse.json({
    configured: !!(airtableToken && airtableBaseId),
    baseId: airtableBaseId ? `${airtableBaseId.substring(0, 8)}...` : 'Not set',
    tableName: airtableTableName,
    tokenSet: !!airtableToken
  })
} 