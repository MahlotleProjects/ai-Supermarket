/*
  # Enhance Sales System and Recommendations

  1. Changes to Sales Table
    - Add sale_items table for grouped purchases
    - Add total_amount to track full purchase amount
    - Add constraints and indexes
  
  2. Updates to Recommendations
    - Add last_sale_date tracking
    - Add new functions for recommendation generation
*/

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  sale_price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add total_amount to sales
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS total_amount numeric NOT NULL DEFAULT 0;

-- Add last_sale_date to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS last_sale_date timestamptz;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_last_sale_date ON products(last_sale_date);

-- Function to generate recommendations for slow-moving products
CREATE OR REPLACE FUNCTION generate_slow_moving_recommendations()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO recommendations (
    type,
    product_id,
    message,
    suggested_action,
    priority,
    is_read
  )
  SELECT 
    'pricing',
    p.id,
    'Product hasn''t sold in over 30 days: ' || p.name,
    'Consider adjusting price or running a promotion. Current price: ' || p.price::text,
    'medium',
    false
  FROM products p
  WHERE 
    p.last_sale_date < NOW() - INTERVAL '30 days'
    AND NOT EXISTS (
      SELECT 1 
      FROM recommendations r 
      WHERE r.product_id = p.id 
      AND r.type = 'pricing'
      AND r.created_at > NOW() - INTERVAL '7 days'
    );
END;
$$;

-- Function to generate recommendations for expiring products
CREATE OR REPLACE FUNCTION generate_expiry_recommendations()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO recommendations (
    type,
    product_id,
    message,
    suggested_action,
    priority,
    is_read
  )
  SELECT 
    'discount',
    p.id,
    'Product expiring soon: ' || p.name || ' (Expires in ' || 
    EXTRACT(DAY FROM (p.expiry_date::timestamp - CURRENT_DATE::timestamp)) || ' days)',
    CASE 
      WHEN p.expiry_date <= CURRENT_DATE + INTERVAL '3 days'
        THEN 'Apply 50% discount. Current price: ' || p.price::text
      WHEN p.expiry_date <= CURRENT_DATE + INTERVAL '7 days'
        THEN 'Apply 30% discount. Current price: ' || p.price::text
      ELSE 'Apply 15% discount. Current price: ' || p.price::text
    END,
    CASE 
      WHEN p.expiry_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'high'
      WHEN p.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'medium'
      ELSE 'low'
    END,
    false
  FROM products p
  WHERE 
    p.expiry_date <= CURRENT_DATE + INTERVAL '10 days'
    AND p.expiry_date > CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 
      FROM recommendations r 
      WHERE r.product_id = p.id 
      AND r.type = 'discount'
      AND r.created_at > NOW() - INTERVAL '1 day'
    );
END;
$$;