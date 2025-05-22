import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  ShoppingCart, 
  Calendar, 
  DollarSign,
  TrendingUp,
  BarChart2,
  Plus,
  AlertCircle,
  Trash2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import StatsCard from '../UI/StatsCard';
import { 
  formatCurrency, 
  formatDate, 
  calculateTotalSales,
  calculateProfit,
  calculateDaysUntilExpiry
} from '../../utils/helpers';
import toast from 'react-hot-toast';

interface SaleFormData {
  product_id: string;
  quantity: number;
  sale_price: number;
  created_at: string;
}

interface SaleItem {
  product_id: string;
  quantity: number;
  sale_price: number;
}

const Sales: React.FC = () => {
  const { products, sales, addSale } = useAppContext();
  
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return date.toISOString().split('T')[0];
    })(),
    end: new Date().toISOString().split('T')[0]
  });
  
  const [showForm, setShowForm] = useState(false);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [currentItem, setCurrentItem] = useState<SaleFormData>({
    product_id: '',
    quantity: 1,
    sale_price: 0,
    created_at: new Date().toISOString().split('T')[0]
  });
  const [showAllSales, setShowAllSales] = useState(false);
  
  // Filter sales by date range
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      
      return saleDate >= startDate && saleDate <= endDate;
    });
  }, [sales, dateRange]);
  
  // Calculate sales metrics
  const metrics = useMemo(() => {
    const totalSales = filteredSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
    
    const totalItems = filteredSales.reduce((sum, sale) => {
      return sum + sale.sale_items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    
    const totalProfit = filteredSales.reduce((sum, sale) => {
      return sum + sale.sale_items.reduce((itemSum, item) => {
        const product = products.find(p => p.id === item.product_id);
        if (!product) return itemSum;
        return itemSum + calculateProfit(product.cost_price, item.sale_price, item.quantity);
      }, 0);
    }, 0);
    
    // Get top selling products
    const productSales: Record<string, { quantity: number; revenue: number }> = {};
    filteredSales.forEach(sale => {
      sale.sale_items.forEach(item => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = { quantity: 0, revenue: 0 };
        }
        productSales[item.product_id].quantity += item.quantity;
        productSales[item.product_id].revenue += item.quantity * item.sale_price;
      });
    });
    
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([productId, stats]) => ({
        id: productId,
        name: products.find(p => p.id === productId)?.name || 'Unknown Product',
        quantity: stats.quantity,
        revenue: stats.revenue
      }));
    
    return {
      totalSales,
      totalItems,
      totalProfit,
      topProducts,
      averageSale: totalSales / (filteredSales.length || 1)
    };
  }, [filteredSales, products]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        setCurrentItem(prev => ({
          ...prev,
          [name]: value,
          sale_price: product.price
        }));
      } else {
        setCurrentItem(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setCurrentItem(prev => ({
        ...prev,
        [name]: name === 'quantity' || name === 'sale_price' 
          ? parseFloat(value) 
          : value
      }));
    }
  };

  const addItemToSale = () => {
    const product = products.find(p => p.id === currentItem.product_id);
    if (!product) {
      toast.error('Please select a product');
      return;
    }

    // Check if product is expired
    if (calculateDaysUntilExpiry(product.expiry_date) <= 0) {
      toast.error('Cannot sell expired products');
      return;
    }

    // Check if we have enough stock
    if (product.quantity < currentItem.quantity) {
      toast.error(`Insufficient stock. Only ${product.quantity} units available.`);
      return;
    }

    // Check if the product is already in the sale
    const existingItemIndex = saleItems.findIndex(item => item.product_id === currentItem.product_id);
    if (existingItemIndex !== -1) {
      const totalQuantity = saleItems[existingItemIndex].quantity + currentItem.quantity;
      if (totalQuantity > product.quantity) {
        toast.error(`Cannot add more units. Total quantity exceeds available stock.`);
        return;
      }
      
      const updatedItems = [...saleItems];
      updatedItems[existingItemIndex].quantity = totalQuantity;
      setSaleItems(updatedItems);
    } else {
      setSaleItems([...saleItems, {
        product_id: currentItem.product_id,
        quantity: currentItem.quantity,
        sale_price: currentItem.sale_price
      }]);
    }

    // Reset current item
    setCurrentItem({
      product_id: '',
      quantity: 1,
      sale_price: 0,
      created_at: currentItem.created_at
    });
  };

  const removeItemFromSale = (productId: string) => {
    setSaleItems(saleItems.filter(item => item.product_id !== productId));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Calculate total amount
      const totalAmount = saleItems.reduce((sum, item) => {
        return sum + (item.quantity * item.sale_price);
      }, 0);

      // Create the sale record
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          total_amount: totalAmount,
          created_at: currentItem.created_at
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(
          saleItems.map(item => ({
            sale_id: saleData.id,
            ...item
          }))
        );

      if (itemsError) throw itemsError;

      // Update product quantities
      for (const item of saleItems) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              quantity: product.quantity - item.quantity,
              last_sale_date: new Date().toISOString()
            })
            .eq('id', item.product_id);

          if (updateError) throw updateError;
        }
      }
      
      setShowForm(false);
      setSaleItems([]);
      setCurrentItem({
        product_id: '',
        quantity: 1,
        sale_price: 0,
        created_at: new Date().toISOString().split('T')[0]
      });
      
      toast.success('Sale recorded successfully!');
    } catch (error: any) {
      toast.error('Error recording sale: ' + error.message);
    }
  };
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Tracking</h1>
          <p className="text-gray-600">Monitor sales performance and trends</p>
        </div>
        
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} className="mr-1" />
          Record Sale
        </button>
      </div>
      
      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Sales"
          value={formatCurrency(metrics.totalSales)}
          icon={<DollarSign size={20} />}
        />
        
        <StatsCard
          title="Items Sold"
          value={metrics.totalItems}
          icon={<ShoppingCart size={20} />}
        />
        
        <StatsCard
          title="Total Profit"
          value={formatCurrency(metrics.totalProfit)}
          icon={<TrendingUp size={20} />}
        />
        
        <StatsCard
          title="Average Sale"
          value={formatCurrency(metrics.averageSale)}
          icon={<BarChart2 size={20} />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Selling Products */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.topProducts.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.quantity} units</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(product.revenue)}</div>
                    </td>
                  </tr>
                ))}
                
                {metrics.topProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No sales data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Sales Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Record New Sale</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="created_at"
                  value={currentItem.created_at}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <select
                  name="product_id"
                  value={currentItem.product_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a product</option>
                  {products
                    .filter(p => p.quantity > 0 && calculateDaysUntilExpiry(p.expiry_date) > 0)
                    .map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {formatCurrency(product.price)} ({product.quantity} in stock)
                      </option>
                    ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={currentItem.quantity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max={
                      currentItem.product_id
                        ? products.find(p => p.id === currentItem.product_id)?.quantity || 1
                        : 1
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Price (per unit)
                  </label>
                  <input
                    type="number"
                    name="sale_price"
                    value={currentItem.sale_price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mb-4">
                <button
                  type="button"
                  onClick={addItemToSale}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={!currentItem.product_id || currentItem.quantity < 1}
                >
                  Add Item
                </button>
              </div>

              {/* Sale Items List */}
              {saleItems.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Sale Items</h3>
                  <div className="border rounded-md divide-y">
                    {saleItems.map(item => {
                      const product = products.find(p => p.id === item.product_id);
                      return (
                        <div key={item.product_id} className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{product?.name}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} x {formatCurrency(item.sale_price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-medium">
                              {formatCurrency(item.quantity * item.sale_price)}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeItemFromSale(item.product_id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div className="p-3 bg-gray-50 flex justify-between font-medium">
                      <span>Total</span>
                      <span>
                        {formatCurrency(
                          saleItems.reduce((sum, item) => sum + (item.quantity * item.sale_price), 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setShowForm(false);
                    setSaleItems([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={saleItems.length === 0}
                >
                  Record Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Recent Sales */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>
          <button
            onClick={() => setShowAllSales(!showAllSales)}
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          >
            {showAllSales ? 'Show Less' : 'View All'}
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sale ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(showAllSales ? filteredSales : filteredSales.slice(0, 10)).map(sale => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{sale.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(sale.created_at)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {sale.sale_items.map(item => {
                        const product = products.find(p => p.id === item.product_id);
                        return (
                          <div key={item.id} className="mb-1">
                            {product?.name} ({item.quantity} x {formatCurrency(item.sale_price)})
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(Number(sale.total_amount))}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No sales data available for the selected date range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;