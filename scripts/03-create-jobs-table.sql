-- Create jobs table for Airtable integration
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Airtable integration fields
  airtable_id TEXT UNIQUE,
  last_sync_date TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending',
  data_source TEXT DEFAULT 'airtable',
  
  -- Required Fields (matching Airtable schema)
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT CHECK (job_type IN ('Full-time', 'Part-time', 'Contract', 'Remote')),
  experience_level TEXT CHECK (experience_level IN ('Entry', 'Mid', 'Senior', 'Executive')),
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  description TEXT,
  requirements TEXT,
  
  -- Management Fields
  status TEXT DEFAULT 'Active' CHECK (status IN ('Draft', 'Active', 'Paused', 'Expired', 'Filled')),
  posted_date DATE,
  expires_date DATE,
  created_by TEXT,
  
  -- Categorization Fields
  industry TEXT,
  department TEXT,
  remote_friendly BOOLEAN DEFAULT false,
  skills_required TEXT[],
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for job access
CREATE POLICY "Anyone can view active jobs" ON jobs
  FOR SELECT USING (status = 'Active');

CREATE POLICY "Admin can manage all jobs" ON jobs
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_airtable_id ON jobs(airtable_id);
CREATE INDEX IF NOT EXISTS idx_jobs_sync_status ON jobs(sync_status);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON jobs(industry);
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_expires_date ON jobs(expires_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 