-- Create resume storage bucket and policies
-- This script sets up secure file storage for user resumes

-- Create the resumes bucket (if it doesn't exist)
-- Note: Bucket creation is typically done via Supabase Dashboard or API
-- This script focuses on RLS policies and bucket configuration

-- Enable Row Level Security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own resumes
CREATE POLICY "Users can upload their own resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can view their own resumes
CREATE POLICY "Users can view their own resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can update their own resumes
CREATE POLICY "Users can update their own resumes" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own resumes
CREATE POLICY "Users can delete their own resumes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add resume fields to profiles table if they don't exist
DO $$ 
BEGIN
  -- Add resume_path column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'resume_path') THEN
    ALTER TABLE profiles ADD COLUMN resume_path TEXT;
  END IF;
  
  -- Add resume_updated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'resume_updated_at') THEN
    ALTER TABLE profiles ADD COLUMN resume_updated_at TIMESTAMPTZ;
  END IF;
  
  -- Add resume_filename column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'resume_filename') THEN
    ALTER TABLE profiles ADD COLUMN resume_filename TEXT;
  END IF;
END $$;

-- Create index on resume_path for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_resume_path ON profiles(resume_path);

-- Create function to clean up old resume files
CREATE OR REPLACE FUNCTION cleanup_old_resumes()
RETURNS void AS $$
BEGIN
  -- This function can be called periodically to clean up orphaned resume files
  -- Implementation would depend on your specific cleanup requirements
  -- For now, this is a placeholder for future implementation
  NULL;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- Create a function to get user's resume URL
CREATE OR REPLACE FUNCTION get_user_resume_url(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  resume_path TEXT;
BEGIN
  SELECT p.resume_path INTO resume_path
  FROM profiles p
  WHERE p.id = user_id;
  
  IF resume_path IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Return the storage URL (this would be constructed in the application)
  RETURN 'resumes/' || resume_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_resume_url(UUID) TO authenticated; 