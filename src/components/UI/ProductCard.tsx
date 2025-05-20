import React from 'react';
import { Product } from '../../types';
import { formatCurrency, calculateDaysUntilExpiry, getStockStatusClass, getExpiryStatusClass } from '../../utils/helpers';
import { Tag, Clock, AlertTriangle, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const daysUntilExpiry = calculateDaysUntilExpiry(product.expiry_date);
  const stockStatusClass = getStockStatusClass(product.quantity);
  const expiryStatusClass = getExpiryStatusClass(product.expiry_date);
  
  const showWarning = product.quantity <= 15 || daysUntilExpiry <= 10;
  
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="h-48 bg-gray-100 relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/300x300?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={48} className="text-gray-400" />
          </div>
        )}
        {showWarning && (
          <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">
            <AlertTriangle size={16} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
              {product.category}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900">{product.name}</h3>
        
        <div className="mt-2 flex justify-between">
          <span className="text-gray-700 font-semibold">{formatCurrency(product.price)}</span>
          <div className={`flex items-center ${stockStatusClass}`}>
            <Tag size={14} className="mr-1" />
            <span className="text-sm">{product.quantity} in stock</span>
          </div>
        </div>
        
        <div className={`mt-2 flex items-center ${expiryStatusClass}`}>
          <Clock size={14} className="mr-1" />
          <span className="text-sm">
            {daysUntilExpiry <= 0 
              ? 'Expired' 
              : `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;