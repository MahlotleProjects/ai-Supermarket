import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.2.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const genAI = new GoogleGenerativeAI('AIzaSyAqySIS-fg0_TALF6laRyKWOn1xwsVD4ps');

interface QueryResult {
  columns: string[];
  rows: any[];
}

async function generateResponse(prompt: string, data: any) {
  // Update to use the correct model configuration
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.0-pro',
    generationConfig: {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    },
  });

  const context = `
    You are an AI assistant for a supermarket inventory management system. 
    You have access to the following data: ${JSON.stringify(data)}
    
    Please analyze this data and provide a detailed, natural response to the query: "${prompt}"
    
    Focus on:
    1. Key metrics and important numbers
    2. Trends and patterns
    3. Actionable insights
    4. Recommendations if applicable
    
    Format the response in a clear, professional manner.
  `;

  const result = await model.generateContent(context);
  const response = result.response;
  return response.text();
}

function determineQueryType(prompt: string): string | null {
  const lowercasePrompt = prompt.toLowerCase();
  
  // Keywords for expired/expiring products
  if (
    lowercasePrompt.includes('expir') ||
    lowercasePrompt.includes('shelf life') ||
    lowercasePrompt.includes('best before') ||
    lowercasePrompt.includes('going bad')
  ) {
    return 'expiry';
  }
  
  // Keywords for stock levels
  if (
    lowercasePrompt.includes('stock') ||
    lowercasePrompt.includes('inventory') ||
    lowercasePrompt.includes('quantity') ||
    lowercasePrompt.includes('available') ||
    lowercasePrompt.includes('supply')
  ) {
    return 'stock';
  }
  
  // Keywords for sales and revenue
  if (
    lowercasePrompt.includes('sale') ||
    lowercasePrompt.includes('revenue') ||
    lowercasePrompt.includes('profit') ||
    lowercasePrompt.includes('income') ||
    lowercasePrompt.includes('earning') ||
    lowercasePrompt.includes('transaction') ||
    lowercasePrompt.includes('money')
  ) {
    return 'sales';
  }
  
  // Keywords for recommendations
  if (
    lowercasePrompt.includes('recommend') ||
    lowercasePrompt.includes('suggest') ||
    lowercasePrompt.includes('advice') ||
    lowercasePrompt.includes('what should') ||
    lowercasePrompt.includes('help me')
  ) {
    return 'recommendations';
  }
  
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { prompt } = await req.json();

    if (!prompt) {
      throw new Error('Please provide a question or query.');
    }

    const queryType = determineQueryType(prompt);
    
    if (!queryType) {
      throw new Error(
        'I\'m not sure what you\'re asking about. Try asking about:\n' +
        '- Products that are expiring or expired\n' +
        '- Current stock levels or inventory\n' +
        '- Sales and revenue information\n' +
        '- Recommendations for inventory management'
      );
    }

    let query = '';
    
    switch (queryType) {
      case 'expiry':
        query = `
          SELECT 
            p.name,
            p.category,
            p.quantity,
            p.cost_price * p.quantity as total_loss,
            p.expiry_date,
            EXTRACT(DAY FROM (p.expiry_date::timestamp - CURRENT_DATE::timestamp)) as days_until_expiry
          FROM products p
          WHERE p.expiry_date <= CURRENT_DATE + INTERVAL '10 days'
          ORDER BY p.expiry_date ASC
        `;
        break;
        
      case 'stock':
        query = `
          SELECT 
            name,
            category,
            quantity,
            price,
            expiry_date
          FROM products
          WHERE quantity <= 15
          ORDER BY quantity ASC
        `;
        break;
        
      case 'sales':
        query = `
          WITH daily_sales AS (
            SELECT 
              DATE_TRUNC('day', created_at) as sale_date,
              SUM(quantity * sale_price) as total_revenue,
              COUNT(*) as num_transactions,
              SUM(quantity) as total_items
            FROM sales
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE_TRUNC('day', created_at)
          )
          SELECT 
            sale_date,
            total_revenue,
            num_transactions,
            total_items,
            LAG(total_revenue) OVER (ORDER BY sale_date) as prev_day_revenue
          FROM daily_sales
          ORDER BY sale_date DESC
          LIMIT 7
        `;
        break;
        
      case 'recommendations':
        query = `
          SELECT 
            r.type,
            r.message,
            r.suggested_action,
            r.priority,
            p.name as product_name,
            p.category,
            p.quantity,
            p.price,
            p.expiry_date
          FROM recommendations r
          LEFT JOIN products p ON r.product_id = p.id
          WHERE NOT r.is_read
          ORDER BY 
            CASE r.priority 
              WHEN 'high' THEN 1 
              WHEN 'medium' THEN 2 
              ELSE 3 
            END,
            r.created_at DESC
        `;
        break;
    }

    // Execute the query
    const { data, error: dbError } = await supabaseClient.rpc('execute_query', { query_text: query });
    
    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Generate AI response using Gemini
    const aiResponse = await generateResponse(prompt, data);

    return new Response(
      JSON.stringify({ response: aiResponse, data }),
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error('AI Assistant Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred while processing your request.',
        details: error.stack
      }),
      { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});