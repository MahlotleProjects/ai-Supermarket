/*
  # Fix Sales RLS Policies

  1. Changes
    - Drop existing RLS policies
    - Create new policies for sales table with proper authentication checks
    - Add policies for sale_items table

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users based on role
    - Ensure staff and admin can manage sales
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete for staff and admin" ON sales;
DROP POLICY IF EXISTS "Enable insert for staff and admin" ON sales;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON sales;
DROP POLICY IF EXISTS "Enable update for staff and admin" ON sales;
DROP POLICY IF EXISTS "Staff can manage sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can view all sale items" ON sale_items;

-- Ensure RLS is enabled
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Sales table policies
CREATE POLICY "Enable read access for authenticated users"
ON sales FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for staff and admin"
ON sales FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

CREATE POLICY "Enable update for staff and admin"
ON sales FOR UPDATE
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
ON sales FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- Sale items table policies
CREATE POLICY "Enable read access for authenticated users"
ON sale_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for staff and admin"
ON sale_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

CREATE POLICY "Enable update for staff and admin"
ON sale_items FOR UPDATE
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
ON sale_items FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);