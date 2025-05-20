import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import RecommendationCard from '../UI/RecommendationCard';
import { CheckCircle, Filter, Lightbulb } from 'lucide-react';

const Recommendations: React.FC = () => {
  const { 
    recommendations, 
    products, 
    markRecommendationAsRead,
    markAllRecommendationsAsRead
  } = useAppContext();
  
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    showRead: false
  });
  
  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    if (filters.type !== 'all' && rec.type !== filters.type) return false;
    if (filters.priority !== 'all' && rec.priority !== filters.priority) return false;
    if (!filters.showRead && rec.isRead) return false;
    return true;
  });
  
  const getProductForRecommendation = (productId: string) => {
    return products.find(p => p.id === productId);
  };
  
  const getUnreadCount = (type: string) => {
    return recommendations.filter(
      r => (type === 'all' || r.type === type) && !r.isRead
    ).length;
  };
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recommendations</h1>
          <p className="text-gray-600">AI-powered insights to optimize your inventory and sales</p>
        </div>
        
        {getUnreadCount('all') > 0 && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
            onClick={markAllRecommendationsAsRead}
          >
            <CheckCircle size={18} className="mr-1" />
            Mark All as Read
          </button>
        )}
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center">
            <Filter size={16} className="mr-2 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <div>
            <label className="text-sm text-gray-700 mr-2">Type:</label>
            <select
              value={filters.type}
              onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types ({getUnreadCount('all')})</option>
              <option value="discount">Discounts ({getUnreadCount('discount')})</option>
              <option value="restock">Restock ({getUnreadCount('restock')})</option>
              <option value="pricing">Pricing ({getUnreadCount('pricing')})</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-700 mr-2">Priority:</label>
            <select
              value={filters.priority}
              onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showRead"
              checked={filters.showRead}
              onChange={e => setFilters(prev => ({ ...prev, showRead: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showRead" className="ml-2 text-sm text-gray-700">
              Show Read
            </label>
          </div>
        </div>
      </div>
      
      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map(recommendation => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              product={getProductForRecommendation(recommendation.productId)}
              onMarkAsRead={markRecommendationAsRead}
            />
          ))
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <Lightbulb size={48} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations</h3>
            <p className="text-gray-600">
              {filters.showRead 
                ? "There are no recommendations matching your current filters." 
                : "You're all caught up! No new recommendations at the moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;