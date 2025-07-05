-- Add resume parsing fields to profiles table
-- This script adds fields to store parsed resume content and AI processing status

-- Add resume parsing fields
DO $$ 
BEGIN
  -- Add resume_text column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'resume_text') THEN
    ALTER TABLE profiles ADD COLUMN resume_text TEXT;
  END IF;
  
  -- Add resume_parsed_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'resume_parsed_at') THEN
    ALTER TABLE profiles ADD COLUMN resume_parsed_at TIMESTAMPTZ;
  END IF;
  
  -- Add resume_parsing_status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'resume_parsing_status') THEN
    ALTER TABLE profiles ADD COLUMN resume_parsing_status TEXT DEFAULT 'pending' 
      CHECK (resume_parsing_status IN ('pending', 'processing', 'completed', 'failed', 'skipped'));
  END IF;
  
  -- Add resume_validation_confidence column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'resume_validation_confidence') THEN
    ALTER TABLE profiles ADD COLUMN resume_validation_confidence INTEGER DEFAULT 0 
      CHECK (resume_validation_confidence >= 0 AND resume_validation_confidence <= 100);
  END IF;
  
  -- Add resume_word_count column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'resume_word_count') THEN
    ALTER TABLE profiles ADD COLUMN resume_word_count INTEGER DEFAULT 0;
  END IF;
  
  -- Add resume_pages column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'resume_pages') THEN
    ALTER TABLE profiles ADD COLUMN resume_pages INTEGER DEFAULT 0;
  END IF;
  
  -- Add resume_format column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'resume_format') THEN
    ALTER TABLE profiles ADD COLUMN resume_format TEXT 
      CHECK (resume_format IN ('pdf', 'docx', 'doc'));
  END IF;
  
  -- Add ai_skills_extracted column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'ai_skills_extracted') THEN
    ALTER TABLE profiles ADD COLUMN ai_skills_extracted BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add ai_skills_extraction_date column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'ai_skills_extraction_date') THEN
    ALTER TABLE profiles ADD COLUMN ai_skills_extraction_date TIMESTAMPTZ;
  END IF;
  
  -- Add ai_extracted_job_title column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'ai_extracted_job_title') THEN
    ALTER TABLE profiles ADD COLUMN ai_extracted_job_title TEXT;
  END IF;
  
  -- Add ai_extracted_experience_level column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'ai_extracted_experience_level') THEN
    ALTER TABLE profiles ADD COLUMN ai_extracted_experience_level TEXT 
      CHECK (ai_extracted_experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive'));
  END IF;
  
  -- Add ai_extracted_skills_confidence column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'ai_extracted_skills_confidence') THEN
    ALTER TABLE profiles ADD COLUMN ai_extracted_skills_confidence JSONB DEFAULT '{}'::jsonb;
  END IF;
  
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_resume_parsing_status ON profiles(resume_parsing_status);
CREATE INDEX IF NOT EXISTS idx_profiles_resume_parsed_at ON profiles(resume_parsed_at);
CREATE INDEX IF NOT EXISTS idx_profiles_ai_skills_extracted ON profiles(ai_skills_extracted);
CREATE INDEX IF NOT EXISTS idx_profiles_resume_validation_confidence ON profiles(resume_validation_confidence);

-- Create GIN index for skills confidence JSONB
CREATE INDEX IF NOT EXISTS idx_profiles_ai_extracted_skills_confidence_gin ON profiles USING GIN (ai_extracted_skills_confidence);

-- Create function to update resume parsing status
CREATE OR REPLACE FUNCTION update_resume_parsing_status(
  profile_id UUID,
  status TEXT,
  resume_text TEXT DEFAULT NULL,
  word_count INTEGER DEFAULT NULL,
  pages INTEGER DEFAULT NULL,
  format_type TEXT DEFAULT NULL,
  validation_confidence INTEGER DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    resume_parsing_status = status,
    resume_parsed_at = CASE WHEN status = 'completed' THEN NOW() ELSE resume_parsed_at END,
    resume_text = COALESCE(resume_text, resume_text),
    resume_word_count = COALESCE(word_count, resume_word_count),
    resume_pages = COALESCE(pages, resume_pages),
    resume_format = COALESCE(format_type, resume_format),
    resume_validation_confidence = COALESCE(validation_confidence, resume_validation_confidence),
    updated_at = NOW()
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update AI skills extraction status
CREATE OR REPLACE FUNCTION update_ai_skills_extraction_status(
  profile_id UUID,
  extracted BOOLEAN,
  job_title TEXT DEFAULT NULL,
  experience_level TEXT DEFAULT NULL,
  skills_confidence JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    ai_skills_extracted = extracted,
    ai_skills_extraction_date = CASE WHEN extracted THEN NOW() ELSE ai_skills_extraction_date END,
    ai_extracted_job_title = COALESCE(job_title, ai_extracted_job_title),
    ai_extracted_experience_level = COALESCE(experience_level, ai_extracted_experience_level),
    ai_extracted_skills_confidence = COALESCE(skills_confidence, ai_extracted_skills_confidence),
    updated_at = NOW()
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_resume_parsing_status(UUID, TEXT, TEXT, INTEGER, INTEGER, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_ai_skills_extraction_status(UUID, BOOLEAN, TEXT, TEXT, JSONB) TO authenticated;

-- Create a view for resume processing status
CREATE OR REPLACE VIEW resume_processing_status AS
SELECT 
  id,
  email,
  full_name,
  resume_path,
  resume_filename,
  resume_parsing_status,
  resume_parsed_at,
  resume_validation_confidence,
  resume_word_count,
  resume_pages,
  resume_format,
  ai_skills_extracted,
  ai_skills_extraction_date,
  ai_extracted_job_title,
  ai_extracted_experience_level,
  CASE 
    WHEN resume_parsing_status = 'completed' AND ai_skills_extracted = true THEN 'fully_processed'
    WHEN resume_parsing_status = 'completed' AND ai_skills_extracted = false THEN 'text_extracted'
    WHEN resume_parsing_status = 'failed' THEN 'failed'
    WHEN resume_parsing_status = 'processing' THEN 'processing'
    ELSE 'pending'
  END as overall_status
FROM profiles
WHERE resume_path IS NOT NULL;

-- Grant select permission on the view
GRANT SELECT ON resume_processing_status TO authenticated; 