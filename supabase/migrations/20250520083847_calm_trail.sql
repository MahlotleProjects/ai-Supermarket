/*
  # Fix Sales Table RLS Policies

  1. Changes
    - Drop existing policies that are causing authorization issues
    - Create new, more specific RLS policies for the sales table
    
  2. Security
    - Enable RLS on sales table (already enabled)
    - Add policies for:
      - Staff/admin can manage all sales
      - All authenticated users can view sales
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Staff can manage sales" ON sales;
DROP POLICY IF EXISTS "Users can view all sales" ON sales;

-- Create new policies with proper security checks
CREATE POLICY "Enable read access for authenticated users"
ON sales
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for staff and admin"
ON sales
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

CREATE POLICY "Enable update for staff and admin"
ON sales
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

CREATE POLICY "Enable delete for staff and admin"
ON sales
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);