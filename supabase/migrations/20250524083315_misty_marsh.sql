/*
  # Fix Sales Structure and Policies

  1. Changes
    - Add user_id to sales table
    - Update RLS policies for sales and sale_items
    - Add indexes for better performance

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Update sales table structure
ALTER TABLE sales ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE sales ALTER COLUMN user_id SET NOT NULL;

-- Enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON sales;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON sales;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON sale_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON sale_items;

-- Create new policies for sales
CREATE POLICY "Enable read access for authenticated users"
ON sales FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON sales FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create new policies for sale_items
CREATE POLICY "Enable read access for authenticated users"
ON sale_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON sale_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sales
    WHERE id = sale_items.sale_id
    AND user_id = auth.uid()
  )
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);