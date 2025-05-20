/*
  # Enhance User Profiles and Fix Database Communication

  1. Updates
    - Add new fields to profiles table
    - Add avatar support
    - Add contact information
    - Add address fields
    - Add preferences
    
  2. Security
    - Update RLS policies for enhanced profile access
    - Add policies for profile updates
*/

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'South Africa',
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS bio text;

-- Update existing RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new RLS policies
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Add index for faster profile lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Add constraint for valid phone numbers (basic format)
ALTER TABLE profiles
ADD CONSTRAINT valid_phone_format
CHECK (phone ~ '^[0-9+\-\s()]*$');