import React from 'react';
import { Recommendation } from '../../types';
import { formatDate } from '../../utils/helpers';
import { AlertCircle, ShoppingCart, TagIcon, CheckCircle } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: Recommendation;
  product: { name: string; category: string } | undefined;
  onMarkAsRead: (id: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  product,
  onMarkAsRead
}) => {
  const getIcon = () => {
    switch (recommendation.type) {
      case 'discount':
        return <TagIcon size={18} className="text-amber-500" />;
      case 'restock':
        return <ShoppingCart size={18} className="text-blue-500" />;
      case 'pricing':
        return <AlertCircle size={18} className="text-green-500" />;
      default:
        return <AlertCircle size={18} className="text-blue-500" />;
    }
  };
  
  const getBorderColor = () => {
    switch (recommendation.priority) {
      case 'high':
        return 'border-red-300';
      case 'medium':
        return 'border-amber-300';
      case 'low':
        return 'border-blue-300';
      default:
        return 'border-gray-200';
    }
  };
  
  const getBackgroundColor = () => {
    if (recommendation.is_read) return 'bg-white';
    
    switch (recommendation.priority) {
      case 'high':
        return 'bg-red-50';
      case 'medium':
        return 'bg-amber-50';
      case 'low':
        return 'bg-blue-50';
      default:
        return 'bg-white';
    }
  };
  
  const getTypeText = () => {
    switch (recommendation.type) {
      case 'discount':
        return 'Apply Discount';
      case 'restock':
        return 'Restock Product';
      case 'pricing':
        return 'Pricing Strategy';
      default:
        return 'Recommendation';
    }
  };
  
  return (
    <div 
      className={`border ${getBorderColor()} rounded-lg ${getBackgroundColor()} p-4 mb-4 transition-all`}
    >
      <div className="flex items-start justify-between">
        <div className="flex">
          <div className="mr-3">{getIcon()}</div>
          <div>
            <div className="flex items-center">
              <span className="font-medium text-gray-900">
                {getTypeText()}
              </span>
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                {recommendation.priority}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {recommendation.message}
            </p>
            {product && (
              <div className="mt-1 flex items-center">
                <span className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-0.5">
                  {product.category}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  {product.name}
                </span>
              </div>
            )}
            <p className="text-sm font-medium mt-3 text-gray-800">
              {recommendation.suggested_action}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {formatDate(recommendation.created_at)}
            </p>
          </div>
        </div>
        
        {!recommendation.is_read && (
          <button
            onClick={() => onMarkAsRead(recommendation.id)}
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          >
            <CheckCircle size={14} className="mr-1" />
            Mark as read
          </button>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;