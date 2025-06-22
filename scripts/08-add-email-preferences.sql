-- Add email notification preferences to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_frequency VARCHAR(20) DEFAULT 'immediate' CHECK (email_frequency IN ('immediate', 'daily', 'weekly', 'never')),
ADD COLUMN IF NOT EXISTS last_email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{
  "job_matches": true,
  "profile_updates": true,
  "weekly_digest": true,
  "system_notifications": true
}'::jsonb;

-- Create index for email notification queries
CREATE INDEX IF NOT EXISTS idx_profiles_email_notifications ON profiles(email_notifications_enabled, email_frequency);

-- Create function to check if user should receive email
CREATE OR REPLACE FUNCTION should_send_email(user_id UUID, email_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_prefs JSONB;
  notifications_enabled BOOLEAN;
  frequency VARCHAR(20);
  last_sent TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get user preferences
  SELECT email_notifications_enabled, email_frequency, email_preferences, last_email_sent_at
  INTO notifications_enabled, frequency, user_prefs, last_sent
  FROM profiles
  WHERE profiles.user_id = should_send_email.user_id;
  
  -- Check if notifications are enabled
  IF NOT notifications_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Check if this email type is enabled
  IF NOT (user_prefs->>email_type)::BOOLEAN THEN
    RETURN FALSE;
  END IF;
  
  -- Check frequency restrictions
  IF frequency = 'never' THEN
    RETURN FALSE;
  ELSIF frequency = 'immediate' THEN
    RETURN TRUE;
  ELSIF frequency = 'daily' THEN
    -- Only send if last email was more than 24 hours ago
    RETURN last_sent IS NULL OR last_sent < NOW() - INTERVAL '24 hours';
  ELSIF frequency = 'weekly' THEN
    -- Only send if last email was more than 7 days ago
    RETURN last_sent IS NULL OR last_sent < NOW() - INTERVAL '7 days';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update last email sent timestamp
CREATE OR REPLACE FUNCTION update_last_email_sent(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET last_email_sent_at = NOW()
  WHERE profiles.user_id = update_last_email_sent.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get users who should receive emails
CREATE OR REPLACE FUNCTION get_users_for_email(email_type TEXT, frequency_filter VARCHAR(20) DEFAULT NULL)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  email_frequency VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.email_frequency
  FROM profiles p
  WHERE p.email_notifications_enabled = true
    AND (p.email_preferences->>email_type)::BOOLEAN = true
    AND (frequency_filter IS NULL OR p.email_frequency = frequency_filter)
    AND (
      p.email_frequency = 'immediate' OR
      (p.email_frequency = 'daily' AND (p.last_email_sent_at IS NULL OR p.last_email_sent_at < NOW() - INTERVAL '24 hours')) OR
      (p.email_frequency = 'weekly' AND (p.last_email_sent_at IS NULL OR p.last_email_sent_at < NOW() - INTERVAL '7 days'))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 