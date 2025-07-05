import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { transformAirtableJob } from '@/lib/jobTransformer';
import type { AirtableJobRecord } from '@/lib/airtable';

export async function POST(request: NextRequest) {
  // Initialize Supabase client inside the handler
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  );

  try {
    const payload = await request.json();

    for (const tableId in payload.changedTablesById) {
      const changes = payload.changedTablesById[tableId];

      // Handle created records
      if (changes.createdRecordsById) {
        for (const recordId in changes.createdRecordsById) {
          const airtableRecord: AirtableJobRecord = { id: recordId, fields: changes.createdRecordsById[recordId].current.cellValuesByFieldId };
          const jobData = transformAirtableJob(airtableRecord);
          const { error } = await supabase.from('jobs').insert(jobData);
          if (error) console.error(`Error inserting new job ${recordId}:`, error);
        }
      }

      // Handle updated records
      if (changes.changedRecordsById) {
        for (const recordId in changes.changedRecordsById) {
           const airtableRecord: AirtableJobRecord = { id: recordId, fields: changes.changedRecordsById[recordId].current.cellValuesByFieldId };
           const jobData = transformAirtableJob(airtableRecord);
           const { error } = await supabase.from('jobs').update(jobData).eq('airtable_id', recordId);
           if (error) console.error(`Error updating job ${recordId}:`, error);
        }
      }

      // Handle destroyed records
      if (changes.destroyedRecordIds) {
        for (const recordId of changes.destroyedRecordIds) {
          const { error } = await supabase.from('jobs').delete().eq('airtable_id', recordId);
          if (error) console.error(`Error deleting job ${recordId}:`, error);
        }
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error('Error processing Airtable webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Airtable may send a GET request to verify the endpoint
export async function GET() {
  return NextResponse.json({ message: 'Airtable webhook endpoint is active.' });
}
