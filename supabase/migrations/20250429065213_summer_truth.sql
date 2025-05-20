/*
  # Add product description field

  1. Changes
    - Add description column to products table
*/

ALTER TABLE products
ADD COLUMN IF NOT EXISTS description text;