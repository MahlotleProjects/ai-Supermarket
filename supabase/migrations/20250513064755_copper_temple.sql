/*
  # Fix sales table schema

  1. Changes
    - Drop existing sales table
    - Create new sales table with correct structure
    - Create sale_items table for individual items
    - Add foreign key constraints and indexes
    
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sales;

-- Create new sales table
CREATE TABLE sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  total_amount numeric NOT NULL DEFAULT 0,
  CONSTRAINT positive_total_amount CHECK (total_amount >= 0)
);

-- Create sale_items table
CREATE TABLE sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  sale_price numeric NOT NULL CHECK (sale_price >= 0),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_product_per_sale UNIQUE (sale_id, product_id)
);

-- Create indexes
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);

-- Enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Staff can manage sales"
  ON sales
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Users can view all sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage sale items"
  ON sale_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Users can view all sale items"
  ON sale_items
  FOR SELECT
  TO authenticated
  USING (true);