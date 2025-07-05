-- Enhance profiles table with additional fields for comprehensive profile management
-- This script adds new fields to support enhanced user profiles

-- Add new profile fields
DO $$ 
BEGIN
  -- Add profile_image_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'profile_image_url') THEN
    ALTER TABLE profiles ADD COLUMN profile_image_url TEXT;
  END IF;
  
  -- Add headline column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'headline') THEN
    ALTER TABLE profiles ADD COLUMN headline TEXT;
  END IF;
  
  -- Add bio column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'bio') THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;
  
  -- Add experience_years column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'experience_years') THEN
    ALTER TABLE profiles ADD COLUMN experience_years INTEGER DEFAULT 0;
  END IF;
  
  -- Add education column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'education') THEN
    ALTER TABLE profiles ADD COLUMN education JSONB DEFAULT '[]'::jsonb;
  END IF;
  
  -- Add preferred_job_types column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'preferred_job_types') THEN
    ALTER TABLE profiles ADD COLUMN preferred_job_types TEXT[] DEFAULT '{}';
  END IF;
  
  -- Add preferred_locations column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'preferred_locations') THEN
    ALTER TABLE profiles ADD COLUMN preferred_locations TEXT[] DEFAULT '{}';
  END IF;
  
  -- Add preferred_salary_range column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'preferred_salary_range') THEN
    ALTER TABLE profiles ADD COLUMN preferred_salary_range JSONB DEFAULT '{"min": 0, "max": 0}'::jsonb;
  END IF;
  
  -- Add website column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'website') THEN
    ALTER TABLE profiles ADD COLUMN website TEXT;
  END IF;
  
  -- Add linkedin_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'linkedin_url') THEN
    ALTER TABLE profiles ADD COLUMN linkedin_url TEXT;
  END IF;
  
  -- Add github_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'github_url') THEN
    ALTER TABLE profiles ADD COLUMN github_url TEXT;
  END IF;
  
  -- Add portfolio_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'portfolio_url') THEN
    ALTER TABLE profiles ADD COLUMN portfolio_url TEXT;
  END IF;
  
  -- Add phone column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
  
  -- Add date_of_birth column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'date_of_birth') THEN
    ALTER TABLE profiles ADD COLUMN date_of_birth DATE;
  END IF;
  
  -- Add availability_status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'availability_status') THEN
    ALTER TABLE profiles ADD COLUMN availability_status TEXT DEFAULT 'Available' CHECK (availability_status IN ('Available', 'Open to opportunities', 'Not looking', 'Employed'));
  END IF;
  
  -- Add work_authorization column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'work_authorization') THEN
    ALTER TABLE profiles ADD COLUMN work_authorization TEXT CHECK (work_authorization IN ('US Citizen', 'Permanent Resident', 'Work Visa', 'Student Visa', 'Other'));
  END IF;
  
  -- Add remote_preference column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'remote_preference') THEN
    ALTER TABLE profiles ADD COLUMN remote_preference TEXT DEFAULT 'Hybrid' CHECK (remote_preference IN ('On-site', 'Hybrid', 'Remote', 'Flexible'));
  END IF;
  
  -- Add relocation_willingness column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'relocation_willingness') THEN
    ALTER TABLE profiles ADD COLUMN relocation_willingness TEXT DEFAULT 'Open to discussion' CHECK (relocation_willingness IN ('Willing to relocate', 'Open to discussion', 'Not willing to relocate'));
  END IF;
  
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_headline ON profiles(headline);
CREATE INDEX IF NOT EXISTS idx_profiles_experience_years ON profiles(experience_years);
CREATE INDEX IF NOT EXISTS idx_profiles_availability_status ON profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_profiles_remote_preference ON profiles(remote_preference);
CREATE INDEX IF NOT EXISTS idx_profiles_work_authorization ON profiles(work_authorization);

-- Create GIN index for JSONB education field
CREATE INDEX IF NOT EXISTS idx_profiles_education_gin ON profiles USING GIN (education);

-- Create GIN index for array fields
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_job_types_gin ON profiles USING GIN (preferred_job_types);
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_locations_gin ON profiles USING GIN (preferred_locations);

-- Create function to validate education JSON structure
CREATE OR REPLACE FUNCTION validate_education_json(education_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if it's an array
  IF jsonb_typeof(education_data) != 'array' THEN
    RETURN FALSE;
  END IF;
  
  -- Validate each education entry
  FOR i IN 0..jsonb_array_length(education_data) - 1 LOOP
    DECLARE
      entry JSONB;
    BEGIN
      entry := education_data->i;
      
      -- Check required fields
      IF NOT (entry ? 'institution' AND entry ? 'degree' AND entry ? 'field') THEN
        RETURN FALSE;
      END IF;
      
      -- Validate field types
      IF jsonb_typeof(entry->'institution') != 'string' OR
         jsonb_typeof(entry->'degree') != 'string' OR
         jsonb_typeof(entry->'field') != 'string' THEN
        RETURN FALSE;
      END IF;
      
      -- Validate dates if present
      IF entry ? 'start_date' AND jsonb_typeof(entry->'start_date') != 'string' THEN
        RETURN FALSE;
      END IF;
      
      IF entry ? 'end_date' AND jsonb_typeof(entry->'end_date') != 'string' THEN
        RETURN FALSE;
      END IF;
    END;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate salary range JSON structure
CREATE OR REPLACE FUNCTION validate_salary_range_json(salary_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if it has required fields
  IF NOT (salary_data ? 'min' AND salary_data ? 'max') THEN
    RETURN FALSE;
  END IF;
  
  -- Validate field types
  IF jsonb_typeof(salary_data->'min') != 'number' OR
     jsonb_typeof(salary_data->'max') != 'number' THEN
    RETURN FALSE;
  END IF;
  
  -- Validate min <= max
  IF (salary_data->>'min')::numeric > (salary_data->>'max')::numeric THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate education JSON before insert/update
CREATE OR REPLACE FUNCTION validate_education_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.education IS NOT NULL AND NOT validate_education_json(NEW.education) THEN
    RAISE EXCEPTION 'Invalid education JSON structure';
  END IF;
  
  IF NEW.preferred_salary_range IS NOT NULL AND NOT validate_salary_range_json(NEW.preferred_salary_range) THEN
    RAISE EXCEPTION 'Invalid salary range JSON structure';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS validate_profile_data ON profiles;
CREATE TRIGGER validate_profile_data
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_education_trigger();

-- Update RLS policies to include new fields
-- Note: Existing policies should already cover these fields, but we can add specific ones if needed

-- Create function to get profile completeness score
CREATE OR REPLACE FUNCTION get_profile_completeness_score(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  profile_record RECORD;
  score INTEGER := 0;
  total_fields INTEGER := 15; -- Total number of important fields
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE id = profile_id;
  
  -- Basic info (40% of score)
  IF profile_record.full_name IS NOT NULL AND profile_record.full_name != '' THEN score := score + 2; END IF;
  IF profile_record.email IS NOT NULL AND profile_record.email != '' THEN score := score + 2; END IF;
  IF profile_record.location IS NOT NULL AND profile_record.location != '' THEN score := score + 2; END IF;
  IF profile_record.job_title IS NOT NULL AND profile_record.job_title != '' THEN score := score + 2; END IF;
  IF profile_record.headline IS NOT NULL AND profile_record.headline != '' THEN score := score + 2; END IF;
  
  -- Professional info (30% of score)
  IF profile_record.experience_level IS NOT NULL AND profile_record.experience_level != '' THEN score := score + 2; END IF;
  IF profile_record.skills IS NOT NULL AND array_length(profile_record.skills, 1) > 0 THEN score := score + 2; END IF;
  IF profile_record.bio IS NOT NULL AND profile_record.bio != '' THEN score := score + 2; END IF;
  IF profile_record.resume_path IS NOT NULL AND profile_record.resume_path != '' THEN score := score + 2; END IF;
  IF profile_record.profile_image_url IS NOT NULL AND profile_record.profile_image_url != '' THEN score := score + 2; END IF;
  
  -- Preferences (20% of score)
  IF profile_record.preferred_job_types IS NOT NULL AND array_length(profile_record.preferred_job_types, 1) > 0 THEN score := score + 2; END IF;
  IF profile_record.preferred_locations IS NOT NULL AND array_length(profile_record.preferred_locations, 1) > 0 THEN score := score + 2; END IF;
  IF profile_record.preferred_salary_range IS NOT NULL AND profile_record.preferred_salary_range != '{"min": 0, "max": 0}'::jsonb THEN score := score + 2; END IF;
  
  -- Contact info (10% of score)
  IF profile_record.phone IS NOT NULL AND profile_record.phone != '' THEN score := score + 1; END IF;
  IF profile_record.linkedin_url IS NOT NULL AND profile_record.linkedin_url != '' THEN score := score + 1; END IF;
  
  -- Return percentage
  RETURN (score * 100) / (total_fields * 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_profile_completeness_score(UUID) TO authenticated;
