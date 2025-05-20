// Common type definitions for the application

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  expiry_date: string; // ISO date string
  cost_price: number;
  image_url?: string;
  description?: string;
}

export interface SaleItem {
  product_id: string;
  quantity: number;
  sale_price: number;
}

export interface SaleRecord {
  id: string;
  created_at: string;
  items: SaleItem[];
  total_amount: number;
}

export type RecommendationType = 'discount' | 'restock' | 'pricing';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  product_id: string;
  message: string;
  suggested_action: string;
  created_at: string; // ISO date string
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system' | 'sales' | 'stock' | 'expiry' | 'master';
  content: string;
  timestamp: string; // ISO date string
}

export interface DashboardMetrics {
  totalProducts: number;
  lowStockProducts: number;
  expiringProducts: number;
  todaySales: number;
  weekSales: number;
  monthSales: number;
  todayRecommendations: number;
}

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
  isRead: boolean;
}