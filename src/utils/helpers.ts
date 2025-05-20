// Helper functions for the application

// Format a date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Format currency for display in ZAR
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
};

// Calculate days until expiry from ISO date string
export const calculateDaysUntilExpiry = (expiryDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Calculate profit from sale
export const calculateProfit = (costPrice: number, salePrice: number, quantity: number): number => {
  return (salePrice - costPrice) * quantity;
};

// Filter products that are about to expire (≤ 10 days)
export const getExpiringProducts = (products: any[]) => {
  return products.filter(product => {
    const daysUntilExpiry = calculateDaysUntilExpiry(product.expiryDate);
    return daysUntilExpiry <= 10 && daysUntilExpiry > 0;
  });
};

// Filter products with low stock (≤ 15 items)
export const getLowStockProducts = (products: any[]) => {
  return products.filter(product => product.quantity <= 15);
};

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Calculate total sales for a period
export const calculateTotalSales = (
  sales: any[], 
  startDate?: Date, 
  endDate?: Date
): number => {
  return sales
    .filter(sale => {
      const saleDate = new Date(sale.date);
      if (startDate && saleDate < startDate) return false;
      if (endDate && saleDate > endDate) return false;
      return true;
    })
    .reduce((sum, sale) => sum + (sale.salePrice * sale.quantity), 0);
};

// Get status class based on stock level
export const getStockStatusClass = (quantity: number): string => {
  if (quantity <= 5) return 'text-red-600';
  if (quantity <= 15) return 'text-amber-500';
  return 'text-green-600';
};

// Get status class based on expiry
export const getExpiryStatusClass = (expiryDate: string): string => {
  const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);
  if (daysUntilExpiry <= 3) return 'text-red-600';
  if (daysUntilExpiry <= 10) return 'text-amber-500';
  return 'text-green-600';
};

// Process AI query and generate response
export const processAIQuery = async (query: string): Promise<{ response: string; agent: string }> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: query })
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Failed to get AI response');
    }
    
    // Determine the agent based on the query content
    let agent: string = 'master';
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('stock') || queryLower.includes('inventory')) {
      agent = 'stock';
    } else if (queryLower.includes('expir')) {
      agent = 'expiry';
    } else if (queryLower.includes('sale') || queryLower.includes('revenue')) {
      agent = 'sales';
    }

    return {
      response: data.response,
      agent
    };
  } catch (error) {
    console.error('Error processing AI query:', error);
    
    // Provide a more user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return {
      response: `I apologize, but I encountered an error while processing your request: ${errorMessage}. Please try rephrasing your question or ask about a specific topic like stock levels, sales, or expiring products.`,
      agent: 'system'
    };
  }
};