/*
  # Fix Sales Tables Structure and Policies

  1. Table Structure
    - Recreate sales and sale_items tables with proper relationships
    - Add necessary constraints and indexes
    
  2. Security
    - Enable RLS on both tables
    - Set up proper policies for staff/admin access
    
  3. Changes
    - Drop and recreate tables to ensure clean state
    - Add foreign key constraints
    - Add proper indexes for performance
*/

-- Drop existing tables (if they exist) to ensure clean state
DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sales;

-- Create sales table
CREATE TABLE sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  total_amount numeric NOT NULL DEFAULT 0,
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Create sale_items table
CREATE TABLE sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  sale_price numeric NOT NULL CHECK (sale_price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);

-- Enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Policies for sales table
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

-- Policies for sale_items table
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