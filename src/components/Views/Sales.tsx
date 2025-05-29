import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingCart, Plus, Minus, Trash2, History, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface SaleItem {
  product: Product;
  quantity: number;
}

interface SaleHistory {
  id: string;
  created_at: string;
  total_amount: number;
  items: {
    product_name: string;
    quantity: number;
    sale_price: number;
  }[];
}

export function Sales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saleHistory, setSaleHistory] = useState<SaleHistory[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchSaleHistory();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Error fetching products: ' + error.message);
    }
  }

  async function fetchSaleHistory() {
    try {
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          id,
          created_at,
          total_amount,
          sale_items (
            quantity,
            sale_price,
            products (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (salesError) throw salesError;

      const formattedSales = salesData?.map(sale => ({
        id: sale.id,
        created_at: sale.created_at,
        total_amount: sale.total_amount,
        items: sale.sale_items.map((item: any) => ({
          product_name: item.products.name,
          quantity: item.quantity,
          sale_price: item.sale_price
        }))
      })) || [];

      setSaleHistory(formattedSales);
    } catch (error: any) {
      toast.error('Error fetching sale history: ' + error.message);
    }
  }

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      toast.error('Product out of stock');
      return;
    }

    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.quantity) {
          toast.error('Cannot add more than available stock');
          return currentCart;
        }
        return currentCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(currentCart =>
      currentCart.map(item => {
        if (item.product.id === productId) {
          const newQuantity = Math.max(0, item.quantity + change);
          if (newQuantity > item.product.quantity) {
            toast.error('Cannot add more than available stock');
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(currentCart => currentCart.filter(item => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create the sale record
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{
          user_id: user.id,
          total_amount: calculateTotal()
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        quantity: item.quantity,
        sale_price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update product quantities
      for (const item of cart) {
        const { error: updateError } = await supabase
          .from('products')
          .update({
            quantity: item.product.quantity - item.quantity,
            last_sale_date: new Date().toISOString()
          })
          .eq('id', item.product.id);

        if (updateError) throw updateError;
      }

      toast.success('Sale recorded successfully!');
      setCart([]);
      await fetchProducts();
      await fetchSaleHistory();
    } catch (error: any) {
      toast.error('Error recording sale: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products List */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map(product => (
              <div
                key={product.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-gray-600">R{product.price.toFixed(2)}</p>
                  <p className={`text-sm ${product.quantity <= 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    {product.quantity <= 0 ? 'Out of stock' : `In stock: ${product.quantity}`}
                  </p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.quantity <= 0}
                  className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Plus size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Shopping Cart */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="text-blue-500" />
            <h2 className="text-xl font-bold">Shopping Cart</h2>
          </div>
          
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4 mb-4">
                {cart.map(item => (
                  <div key={item.product.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="bg-gray-200 p-1 rounded-full hover:bg-gray-300"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="bg-gray-200 p-1 rounded-full hover:bg-gray-300"
                          disabled={item.quantity >= item.product.quantity}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <p className="font-semibold">
                        R{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">R{calculateTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-300"
                >
                  {loading ? 'Processing...' : 'Checkout'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sales History */}
      <div className="mt-8 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="text-blue-500" />
            <h2 className="text-xl font-bold">Recent Sales</h2>
          </div>
          <button
            onClick={() => setShowAllHistory(!showAllHistory)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            {showAllHistory ? 'Show Less' : 'View All'}
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {(showAllHistory ? saleHistory : saleHistory.slice(0, 5)).map(sale => (
            <div key={sale.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-gray-500">{formatDate(sale.created_at)}</p>
                  <p className="font-semibold">Sale ID: {sale.id}</p>
                </div>
                <p className="font-bold">R{sale.total_amount.toFixed(2)}</p>
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 mb-1">Items:</p>
                <div className="space-y-1">
                  {sale.items.map((item, index) => (
                    <div key={index} className="text-sm flex justify-between">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span>R{(item.sale_price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sales;