# Airtable Integration Setup Guide for JobMatch

## Overview
This guide will help you set up Airtable as your job content management system, allowing easy job posting management while syncing to Supabase for user-facing functionality.

## Phase 1: Airtable Setup

### Step 1: Create Airtable Base
1. Go to [https://airtable.com](https://airtable.com)
2. Sign up or log in to your account
3. Create a new base named **"JobMatch AI - Job Management"**

### Step 2: Create Jobs Table
1. In your new base, create a table named **"Jobs"**
2. Add the following fields:

#### Required Fields
- **Job ID** (Formula): `"JOB-" & RECORD_ID()` - Auto-number with prefix
- **Title** (Single line text) *Required
- **Company** (Single line text) *Required  
- **Location** (Single line text) *Required
- **Job Type** (Single select): Full-time, Part-time, Contract, Remote
- **Experience Level** (Single select): Entry, Mid, Senior, Executive
- **Salary Min** (Number): Currency format
- **Salary Max** (Number): Currency format
- **Description** (Long text)
- **Requirements** (Long text)

#### Management Fields
- **Status** (Single select): Draft, Active, Paused, Expired, Filled
- **Posted Date** (Date)
- **Expires Date** (Date)
- **Created By** (Single line text)
- **Last Sync** (Date & Time)
- **Sync Status** (Single select): Pending, Synced, Error

#### Categorization Fields
- **Industry** (Single select): Tech, Finance, Healthcare, etc.
- **Department** (Single select): Engineering, Marketing, Sales, etc.
- **Remote Friendly** (Checkbox)
- **Skills Required** (Long text) - Comma-separated skills
- **Priority** (Single select): High, Medium, Low

### Step 3: Create Airtable Views
1. **Active Jobs** view: Filter by Status = "Active", sorted by Posted Date
2. **Pending Sync** view: Filter by Sync Status = "Pending" or "Error"
3. **Expiring Soon** view: Filter by Expires Date within 7 days
4. **By Company** view: Grouped by Company for management

### Step 4: Get API Credentials
1. Go to your Airtable account settings
2. Navigate to **API** section
3. Generate a **Personal Access Token**
4. Copy your **Base ID** (found in the API documentation)

## Phase 2: Environment Configuration

### Step 1: Update Environment Variables
Add these to your `.env.local` file:

\`\`\`env
# Airtable Configuration
AIRTABLE_TOKEN=your_personal_access_token_here
AIRTABLE_BASE_ID=your_base_id_here
AIRTABLE_TABLE_NAME=Jobs

# Optional: Cron Secret for automated sync
CRON_SECRET=your_secure_random_string_here
\`\`\`

### Step 2: Install Dependencies
The Airtable package has been added to your project. Run:
\`\`\`bash
pnpm install
\`\`\`

## Phase 3: Database Setup

### Step 1: Create Jobs Table in Supabase
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the SQL script from `scripts/03-create-jobs-table.sql`

This creates a comprehensive jobs table with:
- Airtable integration fields
- All required job fields
- Proper indexes for performance
- Row Level Security policies

## Phase 4: Testing the Integration

### Step 1: Add Test Jobs to Airtable
1. In your Airtable base, add 2-3 test jobs with Status = "Active"
2. Fill in required fields (Title, Company, Location)
3. Set Sync Status to "Pending"

### Step 2: Test Manual Sync
1. Start your development server: `pnpm dev`
2. Go to `http://localhost:3000/dashboard`
3. Click on the **"Sync Management"** tab
4. Click **"Run Manual Sync"**
5. Check the results and statistics

### Step 3: Verify Data in Supabase
1. Go to your Supabase dashboard
2. Navigate to **Table Editor**
3. Check the **jobs** table
4. Verify that your Airtable jobs have been synced

## Phase 5: Automated Sync Setup

### Option 1: Vercel Cron (Recommended)
If deploying to Vercel, add this to your `vercel.json`:

\`\`\`json
{
  "crons": [
    {
      "path": "/api/cron/sync-jobs",
      "schedule": "0 */4 * * *"
    }
  ]
}
\`\`\`

### Option 2: External Cron Service
Use services like:
- **Cron-job.org**: Set up to call `https://your-domain.com/api/cron/sync-jobs` every 4 hours
- **EasyCron**: Similar setup with your endpoint
- **GitHub Actions**: For more control

### Option 3: Manual Sync Only
Use the dashboard sync button for manual synchronization as needed.

## Phase 6: Job Posting Workflow

### For Team Members
1. **Create Job in Airtable**:
   - Fill in all required fields
   - Set Status to "Active"
   - Add skills and requirements
   - Set appropriate dates

2. **Automatic Sync Process**:
   - Cron job picks up new/updated jobs every 4 hours
   - Data transforms and validates
   - Inserts into Supabase
   - Updates sync status

3. **User-Facing Display**:
   - Jobs appear in matching algorithm
   - Users receive notifications
   - Apply through platform

## Troubleshooting

### Common Issues

#### "Airtable API Error"
- Check your Personal Access Token is valid
- Verify Base ID is correct
- Ensure table name matches exactly

#### "Sync Status Stuck on Error"
- Check job data for validation errors
- Verify required fields are filled
- Check Supabase connection

#### "Jobs Not Appearing"
- Verify Status = "Active" in Airtable
- Check sync status in dashboard
- Run manual sync to debug

### Debug Steps
1. Check browser console for errors
2. Verify environment variables are loaded
3. Test Airtable connection directly
4. Check Supabase logs for database errors

## Security Considerations

### API Token Security
- Never commit `.env.local` to version control
- Use environment variables in production
- Rotate Personal Access Token regularly

### Access Control
- Limit Airtable base access to team members only
- Use appropriate permission levels
- Monitor sync logs for unusual activity

## Monitoring and Maintenance

### Regular Tasks
- Monitor sync dashboard for errors
- Review sync statistics weekly
- Clean up expired jobs monthly
- Update Airtable schema as needed

### Performance Optimization
- Sync runs every 4 hours to balance freshness and performance
- Rate limiting prevents Airtable API throttling
- Indexes optimize database queries

## Support

For issues with this integration:
1. Check the troubleshooting section above
2. Review sync logs in the dashboard
3. Verify Airtable and Supabase configurations
4. Test with sample data first

---

**Integration Status**: ✅ Complete
**Last Updated**: December 2024
**Version**: 1.0
