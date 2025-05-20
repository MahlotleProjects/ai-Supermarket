import { Product, SaleRecord, Recommendation, ChatMessage, Notification } from '../types';
import { formatDate, calculateDaysUntilExpiry } from './helpers';

// Generate a set of mock products with South African products
export const generateMockProducts = (): Product[] => {
  const products = [
    {
      name: "Clover Full Cream Milk 2L",
      category: "Dairy",
      basePrice: 34.99,
      imageUrl: "https://images.pexels.com/photos/2064359/pexels-photo-2064359.jpeg"
    },
    {
      name: "Albany Superior White Bread",
      category: "Bakery",
      basePrice: 16.99,
      imageUrl: "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg"
    },
    {
      name: "Tastic Rice 2kg",
      category: "Grains",
      basePrice: 49.99,
      imageUrl: "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg"
    },
    {
      name: "Sasko Cake Flour 2.5kg",
      category: "Baking",
      basePrice: 42.99,
      imageUrl: "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg"
    },
    {
      name: "Coca-Cola 2L",
      category: "Beverages",
      basePrice: 24.99,
      imageUrl: "https://images.pexels.com/photos/2983100/pexels-photo-2983100.jpeg"
    },
    {
      name: "Simba Chips Classic 125g",
      category: "Snacks",
      basePrice: 19.99,
      imageUrl: "https://images.pexels.com/photos/4055998/pexels-photo-4055998.jpeg"
    },
    {
      name: "Nulaid Extra Large Eggs 18s",
      category: "Dairy",
      basePrice: 79.99,
      imageUrl: "https://images.pexels.com/photos/162712/eggs-egg-carton-food-162712.jpeg"
    },
    {
      name: "Rama Original Spread 500g",
      category: "Dairy",
      basePrice: 39.99,
      imageUrl: "https://images.pexels.com/photos/531334/pexels-photo-531334.jpeg"
    },
    {
      name: "Koo Baked Beans 410g",
      category: "Canned Goods",
      basePrice: 18.99,
      imageUrl: "https://images.pexels.com/photos/5589149/pexels-photo-5589149.jpeg"
    },
    {
      name: "Jungle Oats 1kg",
      category: "Breakfast",
      basePrice: 44.99,
      imageUrl: "https://images.pexels.com/photos/4051569/pexels-photo-4051569.jpeg"
    },
    {
      name: "Freshpak Rooibos Tea 100s",
      category: "Beverages",
      basePrice: 49.99,
      imageUrl: "https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg"
    },
    {
      name: "Beef Mince Premium 500g",
      category: "Meat",
      basePrice: 89.99,
      imageUrl: "https://images.pexels.com/photos/618775/pexels-photo-618775.jpeg"
    },
    {
      name: "Rainbow Chicken Breasts 1kg",
      category: "Meat",
      basePrice: 109.99,
      imageUrl: "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg"
    },
    {
      name: "Potatoes 2kg Bag",
      category: "Produce",
      basePrice: 29.99,
      imageUrl: "https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg"
    },
    {
      name: "Onions 1kg Bag",
      category: "Produce",
      basePrice: 19.99,
      imageUrl: "https://images.pexels.com/photos/4197447/pexels-photo-4197447.jpeg"
    }
  ];

  return products.map((product, index) => {
    const costPrice = product.basePrice * 0.7; // 30% margin
    const quantity = Math.floor(Math.random() * 200);
    
    // Generate expiry dates: some soon, some later
    const today = new Date();
    const daysToAdd = index % 5 === 0 
      ? Math.floor(Math.random() * 10 + 1) // Some products expiring soon
      : Math.floor(Math.random() * 60 + 10); // Others expiring later
    
    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + daysToAdd);
    
    return {
      id: `p${index + 1}`,
      name: product.name,
      category: product.category,
      price: product.basePrice,
      costPrice,
      quantity,
      expiryDate: expiryDate.toISOString(),
      imageUrl: product.imageUrl
    };
  });
};

// Generate mock sales records for the past 30 days
export const generateMockSales = (products: Product[]): SaleRecord[] => {
  const sales: SaleRecord[] = [];
  const today = new Date();
  
  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() - day);
    
    // Generate 1-10 sales per day
    const salesCount = Math.floor(Math.random() * 10) + 1;
    
    for (let i = 0; i < salesCount; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      
      // Sometimes apply a small discount
      const discountFactor = Math.random() > 0.7 ? 0.9 + Math.random() * 0.1 : 1;
      const salePrice = Math.round(product.price * discountFactor * 100) / 100;
      
      sales.push({
        id: `s${day}${i}`,
        date: date.toISOString(),
        productId: product.id,
        quantity,
        salePrice
      });
    }
  }
  
  return sales;
};

// Generate recommendations based on product data
export const generateRecommendations = (products: Product[]): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  const today = new Date();
  
  products.forEach(product => {
    const daysUntilExpiry = calculateDaysUntilExpiry(product.expiryDate);
    
    // Discount recommendations for soon-to-expire products
    if (daysUntilExpiry <= 10 && daysUntilExpiry > 0) {
      const discountPercent = daysUntilExpiry <= 3 ? 50 : daysUntilExpiry <= 7 ? 30 : 15;
      
      recommendations.push({
        id: `rec-disc-${product.id}`,
        type: 'discount',
        productId: product.id,
        message: `${product.name} expires in ${daysUntilExpiry} days`,
        suggestedAction: `Apply ${discountPercent}% discount to boost sales before expiry`,
        createdAt: today.toISOString(),
        priority: daysUntilExpiry <= 3 ? 'high' : 'medium',
        isRead: false
      });
    }
    
    // Restock recommendations for low stock products
    if (product.quantity <= 15) {
      recommendations.push({
        id: `rec-stock-${product.id}`,
        type: 'restock',
        productId: product.id,
        message: `${product.name} is low in stock (${product.quantity} remaining)`,
        suggestedAction: `Order more units to maintain optimal inventory levels`,
        createdAt: today.toISOString(),
        priority: product.quantity <= 5 ? 'high' : 'medium',
        isRead: false
      });
    }
    
    // Random pricing recommendations for some products
    if (Math.random() > 0.8) {
      const action = Math.random() > 0.5 
        ? `Consider increasing price by 5-10% based on market trends` 
        : `Consider promotional pricing to boost sales volume`;
      
      recommendations.push({
        id: `rec-price-${product.id}`,
        type: 'pricing',
        productId: product.id,
        message: `Sales analysis for ${product.name}`,
        suggestedAction: action,
        createdAt: today.toISOString(),
        priority: 'low',
        isRead: Math.random() > 0.5
      });
    }
  });
  
  return recommendations;
};

// Generate initial chat messages
export const generateInitialChatMessages = (): ChatMessage[] => {
  return [
    {
      id: 'msg1',
      sender: 'system',
      content: 'Welcome to SupermarketAI Assistant. How can I help you today?',
      timestamp: new Date().toISOString()
    }
  ];
};

// Generate notifications
export const generateNotifications = (products: Product[]): Notification[] => {
  const notifications: Notification[] = [];
  
  // Find expiring products
  const expiringProducts = products.filter(p => calculateDaysUntilExpiry(p.expiryDate) <= 3);
  expiringProducts.forEach(product => {
    notifications.push({
      id: `notif-exp-${product.id}`,
      type: 'warning',
      message: `${product.name} expires in ${calculateDaysUntilExpiry(product.expiryDate)} days`,
      timestamp: new Date().toISOString(),
      isRead: false
    });
  });
  
  // Find critically low stock
  const lowStockProducts = products.filter(p => p.quantity <= 5);
  lowStockProducts.forEach(product => {
    notifications.push({
      id: `notif-stock-${product.id}`,
      type: 'error',
      message: `${product.name} is critically low (${product.quantity} remaining)`,
      timestamp: new Date().toISOString(),
      isRead: false
    });
  });
  
  // Add some general notifications
  notifications.push({
    id: 'notif-sys-1',
    type: 'info',
    message: 'Daily sales report is ready for review',
    timestamp: new Date().toISOString(),
    isRead: true
  });
  
  notifications.push({
    id: 'notif-sys-2',
    type: 'success',
    message: 'Inventory reconciliation completed successfully',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isRead: true
  });
  
  return notifications;
};