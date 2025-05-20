/*
  # Add Execute Query Function

  1. Changes
    - Add a secure function to execute read-only queries
    - Add proper validation and security checks
    - Grant execute permission to authenticated users
*/

CREATE OR REPLACE FUNCTION public.execute_query(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Validate input
  IF query_text IS NULL OR query_text = '' THEN
    RAISE EXCEPTION 'Query text cannot be empty';
  END IF;

  -- Ensure query is read-only
  IF query_text ~* '\m(insert|update|delete|drop|alter|create|truncate)\M' THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;

  -- Execute query and convert result to JSONB
  EXECUTE format('
    WITH query_result AS (%s)
    SELECT jsonb_agg(row_to_json(query_result))
    FROM query_result;
  ', query_text) INTO result;

  -- Handle null result
  IF result IS NULL THEN
    result := '[]'::JSONB;
  END IF;

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_query(TEXT) TO authenticated;