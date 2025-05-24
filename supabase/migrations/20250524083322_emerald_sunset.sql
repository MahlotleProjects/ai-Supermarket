/*
  # Fix Authentication Trigger

  1. Changes
    - Update handle_new_user trigger to properly create profile on signup
    - Ensure trigger handles all required profile fields

  2. Security
    - Function runs with security definer for proper permissions
*/

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at,
    avatar_url,
    phone,
    address,
    city,
    postal_code,
    country,
    preferences,
    bio
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'user',
    now(),
    now(),
    null,
    null,
    null,
    null,
    null,
    'South Africa',
    '{}'::jsonb,
    null
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();