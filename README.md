# JobMatch V1.1

AI-Powered Job Discovery Platform with Supabase Integration & Airtable Sync

## 🚀 Version 1.1 Features

- **Complete Landing Page** - Professional, conversion-focused design
- **User Authentication** - Supabase-powered sign up/sign in system
- **Database Integration** - Profiles, job matches, and jobs with Row Level Security
- **Airtable Integration** - Complete job content management system with sync
- **Responsive Design** - Mobile-first approach with modern UI components
- **Production Ready** - Fully configured and tested Supabase connection
- **Admin Dashboard** - Sync management and job statistics

## Getting Started

1. Install dependencies:
   ```
   pnpm install
   ```

2. Configure environment variables:
   Create a `.env.local` file with your credentials:
   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Airtable Configuration
   AIRTABLE_TOKEN=your_personal_access_token
   AIRTABLE_BASE_ID=your_base_id
   AIRTABLE_TABLE_NAME=Jobs
   
   # Optional: Cron Secret for automated sync
   CRON_SECRET=your_secure_random_string
   ```

3. Set up your database:
   - Run the SQL scripts in the `scripts/` folder in your Supabase dashboard
   - Follow the `AIRTABLE_SETUP_GUIDE.md` for Airtable configuration

4. Run the development server:
   ```
   pnpm dev
   ```

5. Test the connection:
   Visit `http://localhost:3000/test` to verify Supabase setup
   Visit `http://localhost:3000/dashboard` and go to "Sync Management" to test Airtable sync

## Project Structure
- `app/` - Next.js app router pages and layouts
- `components/` - Reusable UI components and pages
- `lib/` - Utility functions, Supabase and Airtable configuration
- `contexts/` - React context providers
- `hooks/` - Custom React hooks
- `styles/` - Global styles and CSS
- `public/` - Static assets
- `scripts/` - Database setup scripts

## Database Schema
- **profiles** - User profile information with RLS policies
- **job_matches** - Job matching data with user relationships
- **jobs** - Job listings synced from Airtable with comprehensive fields

## Airtable Integration

### Features
- **Bidirectional Sync** - Jobs sync from Airtable to Supabase every 4 hours
- **Real-time Dashboard** - Monitor sync status and statistics
- **Data Validation** - Comprehensive validation and error handling
- **Rate Limiting** - Respects Airtable API limits
- **Error Recovery** - Automatic retry and error reporting

### Job Management Workflow
1. Create jobs in Airtable with Status = "Active"
2. Automatic sync every 4 hours via cron job
3. Jobs appear in user-facing matching algorithm
4. Monitor sync status via admin dashboard

## Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Job Management**: Airtable API integration
- **Package Manager**: pnpm

## API Endpoints

### Job Sync
- `POST /api/jobs/sync` - Manual job synchronization
- `GET /api/jobs/sync` - Get sync statistics
- `POST /api/cron/sync-jobs` - Automated sync (cron job)

### Authentication
- Supabase Auth integration
- Protected routes and dashboard access

## Git Status
✅ Initialized and ready for development
✅ V1.1 with Airtable integration committed
✅ Supabase connection tested and working
✅ Airtable sync system implemented

## Documentation
- `AIRTABLE_SETUP_GUIDE.md` - Complete Airtable integration guide
- `SUPABASE_SETUP_GUIDE.md` - Supabase setup instructions
- `scripts/` - Database setup scripts

---
*JobMatch V1.1 - Ready for production deployment with Airtable integration* 