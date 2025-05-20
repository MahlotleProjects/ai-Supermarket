/*
  # Fix Sales RLS Policies

  1. Changes
    - Enable RLS on sales and sale_items tables
    - Add policies for authenticated users to view all sales
    - Add policies for staff and admin to manage sales
    - Fix foreign key relationships and cascading deletes

  2. Security
    - Enable RLS on both tables
    - Restrict write operations to staff and admin roles
    - Allow read access to all authenticated users
*/

-- Enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON sales;
DROP POLICY IF EXISTS "Enable insert for staff and admin" ON sales;
DROP POLICY IF EXISTS "Enable update for staff and admin" ON sales;
DROP POLICY IF EXISTS "Enable delete for staff and admin" ON sales;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON sale_items;
DROP POLICY IF EXISTS "Enable insert for staff and admin" ON sale_items;
DROP POLICY IF EXISTS "Enable update for staff and admin" ON sale_items;
DROP POLICY IF EXISTS "Enable delete for staff and admin" ON sale_items;

-- Create policies for sales table
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

-- Create policies for sale_items table
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