import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product, SaleRecord, Recommendation, ChatMessage, Notification } from '../types';
import { generateId, processAIQuery } from '../utils/helpers';
import toast from 'react-hot-toast';

interface AppContextType {
  products: Product[];
  sales: SaleRecord[];
  recommendations: Recommendation[];
  chatMessages: ChatMessage[];
  notifications: Notification[];
  selectedView: string;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSale: (sale: { product_id: string; quantity: number; sale_price: number; created_at: string }) => Promise<void>;
  markRecommendationAsRead: (id: string) => Promise<void>;
  markAllRecommendationsAsRead: () => Promise<void>;
  sendChatMessage: (content: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  setSelectedView: (view: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedView, setSelectedView] = useState<string>('dashboard');

  useEffect(() => {
    fetchProducts();
    fetchSales();
    fetchRecommendations();
    
    const productsSubscription = supabase
      .channel('products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, 
        payload => {
          fetchProducts();
          checkLowStock(payload.new);
        }
      )
      .subscribe();

    const salesSubscription = supabase
      .channel('sales_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' },
        () => {
          fetchSales();
          generateSalesNotification();
        }
      )
      .subscribe();

    const recommendationsSubscription = supabase
      .channel('recommendations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recommendations' },
        payload => {
          fetchRecommendations();
          if (payload.eventType === 'INSERT') {
            generateRecommendationNotification(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      productsSubscription.unsubscribe();
      salesSubscription.unsubscribe();
      recommendationsSubscription.unsubscribe();
    };
  }, []);

  const checkLowStock = (product: any) => {
    if (product.quantity <= 15) {
      const notification: Notification = {
        id: generateId(),
        type: product.quantity <= 5 ? 'error' : 'warning',
        message: `${product.name} is running low (${product.quantity} units remaining)`,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      setNotifications(prev => [notification, ...prev]);
    }
  };

  const generateSalesNotification = () => {
    const notification: Notification = {
      id: generateId(),
      type: 'success',
      message: 'New sale recorded successfully',
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const generateRecommendationNotification = (recommendation: any) => {
    const notification: Notification = {
      id: generateId(),
      type: recommendation.priority === 'high' ? 'error' : 'warning',
      message: recommendation.message,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Error fetching products: ' + error.message);
    }
  };

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error: any) {
      toast.error('Error fetching sales: ' + error.message);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error: any) {
      toast.error('Error fetching recommendations: ' + error.message);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;

      if (product.quantity <= 15) {
        await generateStockRecommendation(data.id, product.quantity);
      }

      toast.success('Product added successfully!');
    } catch (error: any) {
      toast.error('Error adding product: ' + error.message);
      throw error;
    }
  };

  const generateStockRecommendation = async (productId: string, quantity: number) => {
    try {
      await supabase
        .from('recommendations')
        .insert([{
          type: 'restock',
          product_id: productId,
          message: `Low initial stock level (${quantity} units)`,
          suggested_action: 'Consider ordering more units to maintain optimal inventory levels',
          priority: quantity <= 5 ? 'high' : 'medium',
          is_read: false
        }]);
    } catch (error) {
      console.error('Error generating recommendation:', error);
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', product.id);

      if (error) throw error;
      toast.success('Product updated successfully!');
    } catch (error: any) {
      toast.error('Error updating product: ' + error.message);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Product deleted successfully!');
    } catch (error: any) {
      toast.error('Error deleting product: ' + error.message);
      throw error;
    }
  };

  const addSale = async (sale: { product_id: string; quantity: number; sale_price: number; created_at: string }) => {
    try {
      // Insert the sale record
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([{
          created_at: sale.created_at,
          total_amount: sale.quantity * sale.sale_price
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // Insert the sale item
      const { error: itemError } = await supabase
        .from('sale_items')
        .insert([{
          sale_id: saleData.id,
          product_id: sale.product_id,
          quantity: sale.quantity,
          sale_price: sale.sale_price
        }]);

      if (itemError) throw itemError;

      // Update product quantity
      const { data: product } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', sale.product_id)
        .single();

      if (product) {
        const newQuantity = product.quantity - sale.quantity;
        
        await supabase
          .from('products')
          .update({ 
            quantity: newQuantity,
            last_sale_date: new Date().toISOString()
          })
          .eq('id', sale.product_id);

        if (newQuantity <= 15) {
          await generateStockRecommendation(sale.product_id, newQuantity);
        }
      }

      toast.success('Sale recorded successfully!');
      
      await fetchProducts();
      await fetchSales();
    } catch (error: any) {
      toast.error('Error recording sale: ' + error.message);
      throw error;
    }
  };

  const markRecommendationAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recommendations')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      toast.error('Error updating recommendation: ' + error.message);
    }
  };

  const markAllRecommendationsAsRead = async () => {
    try {
      const { error } = await supabase
        .from('recommendations')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
      
      await fetchRecommendations();
      
      toast.success('All recommendations marked as read');
    } catch (error: any) {
      toast.error('Error updating recommendations: ' + error.message);
    }
  };

  const sendChatMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: generateId(),
      sender: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prevMessages => [...prevMessages, userMessage]);
    
    setTimeout(() => {
      const { response, agent } = processAIQuery(content);
      
      const aiMessage: ChatMessage = {
        id: generateId(),
        sender: agent,
        content: response,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prevMessages => [...prevMessages, aiMessage]);
    }, 500);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const value = {
    products,
    sales,
    recommendations,
    chatMessages,
    notifications,
    selectedView,
    addProduct,
    updateProduct,
    deleteProduct,
    addSale,
    markRecommendationAsRead,
    markAllRecommendationsAsRead,
    sendChatMessage,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setSelectedView
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};