/*
  # Fix profiles table setup

  1. Changes
    - Enable RLS on profiles table
    - Add trigger for automatic user profile creation
    - Update RLS policies for proper access control
    
  2. Security
    - Enable RLS
    - Add policies for user profile management
    - Set up trigger for automatic profile creation
*/

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a secure policy for viewing profiles
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- Create a secure policy for inserting profiles
CREATE POLICY "Enable insert for authenticated users only"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
);

-- Create a secure policy for updating profiles
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
);

-- Create or replace the trigger function for handling new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();