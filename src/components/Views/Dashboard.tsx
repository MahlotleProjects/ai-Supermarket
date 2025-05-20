import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import StatsCard from '../UI/StatsCard';
import ProductCard from '../UI/ProductCard';
import RecommendationCard from '../UI/RecommendationCard';
import { 
  Package, 
  AlertTriangle, 
  DollarSign,
  TrendingUp,
  ArrowRight,
  AlertOctagon,
  Trash2
} from 'lucide-react';
import { 
  calculateTotalSales, 
  formatCurrency, 
  getExpiringProducts,
  getLowStockProducts,
  calculateDaysUntilExpiry
} from '../../utils/helpers';

const Dashboard: React.FC = () => {
  const { products, sales, recommendations, markRecommendationAsRead, deleteProduct } = useAppContext();
  const [showAllExpired, setShowAllExpired] = useState(false);
  
  // Calculate metrics
  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const todaySales = calculateTotalSales(sales, today);
    const yesterdaySales = calculateTotalSales(sales, yesterday, today);
    const weekSales = calculateTotalSales(sales, weekAgo);
    const prevWeekSales = calculateTotalSales(
      sales, 
      new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000), 
      weekAgo
    );

    // Calculate expired products and losses
    const expiredProducts = products.filter(p => calculateDaysUntilExpiry(p.expiry_date) <= 0);
    const totalLoss = expiredProducts.reduce((sum, product) => {
      return sum + (product.cost_price * product.quantity);
    }, 0);
    
    // Calculate percentage changes
    const dailyChange = yesterdaySales === 0 
      ? 100 
      : Math.round((todaySales - yesterdaySales) / yesterdaySales * 100);
      
    const weeklyChange = prevWeekSales === 0 
      ? 100 
      : Math.round((weekSales - prevWeekSales) / prevWeekSales * 100);
    
    return {
      totalProducts: products.length,
      lowStockProducts: getLowStockProducts(products).length,
      expiringProducts: getExpiringProducts(products).length,
      expiredProducts: expiredProducts.length,
      totalLoss,
      todaySales: formatCurrency(todaySales),
      weekSales: formatCurrency(weekSales),
      dailyChange,
      weeklyChange
    };
  }, [products, sales]);

  // Get expired products
  const expiredProducts = useMemo(() => {
    return products
      .filter(p => calculateDaysUntilExpiry(p.expiry_date) <= 0)
      .sort((a, b) => calculateDaysUntilExpiry(a.expiry_date) - calculateDaysUntilExpiry(b.expiry_date));
  }, [products]);
  
  // Get high-priority recommendations
  const highPriorityRecommendations = useMemo(() => {
    return recommendations
      .filter(rec => rec.priority === 'high' && !rec.isRead)
      .slice(0, 3);
  }, [recommendations]);
  
  // Get low stock and expiring products
  const criticalProducts = useMemo(() => {
    const lowStock = getLowStockProducts(products).slice(0, 3);
    const expiring = getExpiringProducts(products)
      .filter(p => !lowStock.some(ls => ls.id === p.id))
      .slice(0, 3 - lowStock.length);
    
    return [...lowStock, ...expiring];
  }, [products]);

  const handleClearExpired = async (productId: string) => {
    if (confirm('Are you sure you want to remove this expired product?')) {
      await deleteProduct(productId);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your store's performance and critical alerts</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Products"
          value={metrics.totalProducts}
          icon={<Package size={20} />}
        />
        
        <StatsCard
          title="Low Stock Items"
          value={metrics.lowStockProducts}
          icon={<AlertTriangle size={20} />}
          bgColor={metrics.lowStockProducts > 0 ? 'bg-red-50' : 'bg-white'}
          textColor={metrics.lowStockProducts > 0 ? 'text-red-700' : 'text-gray-900'}
        />
        
        <StatsCard
          title="Today's Sales"
          value={metrics.todaySales}
          icon={<DollarSign size={20} />}
          change={metrics.dailyChange}
          changeLabel="vs yesterday"
        />
        
        <StatsCard
          title="This Week Sales"
          value={metrics.weekSales}
          icon={<TrendingUp size={20} />}
          change={metrics.weeklyChange}
          changeLabel="vs last week"
        />
      </div>

      {/* Expired Products Section */}
      {expiredProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AlertOctagon size={24} className="text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-red-900">
                Expired Products ({expiredProducts.length})
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-red-900 font-semibold">
                Total Loss: {formatCurrency(metrics.totalLoss)}
              </div>
              {expiredProducts.length > 3 && (
                <button
                  onClick={() => setShowAllExpired(!showAllExpired)}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center"
                >
                  {showAllExpired ? 'Show Less' : 'View All'}
                  <ArrowRight size={16} className="ml-1" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(showAllExpired ? expiredProducts : expiredProducts.slice(0, 3)).map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm p-4 border border-red-200">
                <div className="flex items-center mb-2">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/100?text=No+Image';
                        }}
                      />
                    ) : (
                      <Package size={24} className="text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <span className="text-sm text-red-600">
                      Expired {Math.abs(calculateDaysUntilExpiry(product.expiry_date))} days ago
                    </span>
                  </div>
                  <button
                    onClick={() => handleClearExpired(product.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Remove expired product"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{product.quantity} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost Price:</span>
                    <span className="font-medium">{formatCurrency(product.cost_price)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Total Loss:</span>
                    <span>{formatCurrency(product.cost_price * product.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Products */}
        <div className="lg:col-span-2">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Critical Products</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                View all <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {criticalProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
              
              {criticalProducts.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No critical products at the moment
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* High Priority Recommendations */}
        <div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Critical Recommendations</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                View all <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
            
            {highPriorityRecommendations.map(rec => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                product={products.find(p => p.id === rec.productId)}
                onMarkAsRead={markRecommendationAsRead}
              />
            ))}
            
            {highPriorityRecommendations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No critical recommendations at the moment
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;