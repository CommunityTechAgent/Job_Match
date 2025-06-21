-- Create job_matches table (simplified version)
CREATE TABLE IF NOT EXISTS job_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT,
  job_description TEXT,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  job_url TEXT,
  cover_letter_generated BOOLEAN DEFAULT FALSE,
  cover_letter_content TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  email_content TEXT,
  response_received BOOLEAN DEFAULT FALSE,
  response_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON job_matches
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON job_matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON job_matches
  FOR UPDATE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS job_matches_user_id_idx ON job_matches(user_id);
CREATE INDEX IF NOT EXISTS job_matches_created_at_idx ON job_matches(created_at DESC);
CREATE INDEX IF NOT EXISTS job_matches_match_score_idx ON job_matches(match_score DESC);
