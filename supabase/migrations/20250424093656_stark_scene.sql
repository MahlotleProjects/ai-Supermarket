/*
  # Initial Schema Setup

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `email` (text)
      - `full_name` (text)
      - `role` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text)
      - `price` (numeric)
      - `cost_price` (numeric)
      - `quantity` (integer)
      - `expiry_date` (date)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `sales`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `sale_price` (numeric)
      - `created_at` (timestamp)
    
    - `recommendations`
      - `id` (uuid, primary key)
      - `type` (text)
      - `product_id` (uuid, foreign key)
      - `message` (text)
      - `suggested_action` (text)
      - `priority` (text)
      - `is_read` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  cost_price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  expiry_date date NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  sale_price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create recommendations table
CREATE TABLE recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  message text NOT NULL,
  suggested_action text NOT NULL,
  priority text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view all products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Users can view all sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage sales"
  ON sales
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Users can view all recommendations"
  ON recommendations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update recommendation read status"
  ON recommendations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();