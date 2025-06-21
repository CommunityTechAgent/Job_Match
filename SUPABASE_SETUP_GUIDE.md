# Supabase Setup Guide for JobMatch

## Step 1: Get Your Supabase Credentials

### 1.1 Create/Login to Supabase
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Create a new project or select an existing one

### 1.2 Get Your Project Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 1.3 Update Your Environment Variables
Replace the placeholder values in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 2: Create Database Tables

### 2.1 Go to SQL Editor
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**

### 2.2 Create Profiles Table
Run this SQL:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  location TEXT,
  job_title TEXT,
  experience_level TEXT,
  skills TEXT[],
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on user_id
CREATE UNIQUE INDEX profiles_user_id_idx ON profiles(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 2.3 Create Job Matches Table
Run this SQL:

```sql
-- Create job_matches table
CREATE TABLE job_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT NOT NULL,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  job_url TEXT,
  cover_letter_generated BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  response_received BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX job_matches_user_id_idx ON job_matches(user_id);

-- Enable Row Level Security
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own job matches" ON job_matches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job matches" ON job_matches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job matches" ON job_matches
  FOR UPDATE USING (auth.uid() = user_id);
```

## Step 3: Enable Authentication

### 3.1 Configure Email Auth
1. Go to **Authentication** → **Settings**
2. Enable **Email authentication**
3. Configure any additional settings as needed

### 3.2 Test the Setup
1. Start your development server: `pnpm dev`
2. Go to `http://localhost:3000/test`
3. Click "Run Connection Test" to verify everything works

## Troubleshooting

### "Tenant or user not found" Error
This usually means:
1. **Invalid project URL** - Double-check your Supabase URL
2. **Invalid API key** - Make sure you're using the `anon public` key, not the `service_role` key
3. **Project is paused** - Check if your Supabase project is active

### Tables Don't Exist Error
1. Make sure you ran the SQL scripts in the correct order
2. Check that the tables were created in the **Table Editor**
3. Verify RLS policies are enabled

### Connection Issues
1. Check your internet connection
2. Verify the Supabase project is not paused
3. Ensure environment variables are loaded (restart your dev server) 