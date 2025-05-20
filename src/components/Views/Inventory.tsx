import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Package, 
  Search, 
  Plus, 
  Trash2, 
  X, 
  Edit,
  HelpCircle,
  Info
} from 'lucide-react';
import { formatCurrency, calculateDaysUntilExpiry, getStockStatusClass, getExpiryStatusClass } from '../../utils/helpers';

interface ProductFormData {
  id?: string;
  name: string;
  category: string;
  price: number;
  cost_price: number; // Changed from costPrice to cost_price
  quantity: number;
  expiry_date: string; // Changed from expiryDate to expiry_date
  image_url?: string; // Changed from imageUrl to image_url
  description?: string; // Added description field
}

interface FormTooltip {
  title: string;
  description: string;
}

const tooltips: Record<string, FormTooltip> = {
  name: {
    title: "Product Name",
    description: "Enter a clear, descriptive name that customers can easily understand (e.g., 'Organic Red Apples 1kg' rather than just 'Apples')"
  },
  category: {
    title: "Category",
    description: "Choose or enter a category to organize products. Use existing categories when possible for consistency"
  },
  price: {
    title: "Sale Price",
    description: "The retail price customers will pay. Should be higher than the cost price to ensure profit"
  },
  cost_price: {
    title: "Cost Price",
    description: "The price you pay to acquire the product. Used to calculate profit margins"
  },
  quantity: {
    title: "Quantity",
    description: "Current stock level. System will alert when stock falls below 15 units"
  },
  expiry_date: {
    title: "Expiry Date",
    description: "Product's expiration date. System will suggest discounts for products nearing expiry"
  },
  image_url: {
    title: "Image URL",
    description: "Link to product image. Use high-quality images with clear backgrounds. Leave empty to use default placeholder"
  },
  description: {
    title: "Description",
    description: "Detailed description of the product including key features, ingredients, or any special handling instructions"
  }
};

const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    price: 0,
    cost_price: 0,
    quantity: 0,
    expiry_date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  
  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category))).sort();
  
  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  // Calculate profit margin
  const calculateProfitMargin = () => {
    if (!formData.price || !formData.cost_price) return 0;
    return ((formData.price - formData.cost_price) / formData.price) * 100;
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'cost_price' || name === 'quantity' 
        ? parseFloat(value) 
        : value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        await updateProduct({
          ...formData,
          id: editingProduct
        });
      } else {
        await addProduct(formData);
      }
      
      // Reset form
      setFormData({
        name: '',
        category: '',
        price: 0,
        cost_price: 0,
        quantity: 0,
        expiry_date: new Date().toISOString().split('T')[0],
        description: ''
      });
      
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      // Error handling is done in the context
    }
  };
  
  // Edit product
  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      cost_price: product.cost_price,
      quantity: product.quantity,
      expiry_date: new Date(product.expiry_date).toISOString().split('T')[0],
      image_url: product.image_url,
      description: product.description
    });
    
    setEditingProduct(product.id);
    setShowForm(true);
  };
  
  // Delete product confirmation
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
      } catch (error) {
        // Error handling is done in the context
      }
    }
  };
  
  const renderTooltip = (field: string) => {
    if (activeTooltip !== field) return null;
    
    const tooltip = tooltips[field];
    if (!tooltip) return null;
    
    return (
      <div className="absolute z-50 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg mt-1">
        <h4 className="font-medium mb-1">{tooltip.title}</h4>
        <p className="text-gray-300 text-xs">{tooltip.description}</p>
      </div>
    );
  };
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your products, stock levels, and expiry dates</p>
        </div>
        
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} className="mr-1" />
          Add Product
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Product Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Product Name
                    </label>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onMouseEnter={() => setActiveTooltip('name')}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <HelpCircle size={16} />
                    </button>
                  </div>
                  {renderTooltip('name')}
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Organic Red Apples 1kg"
                  />
                </div>
                
                {/* Category */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onMouseEnter={() => setActiveTooltip('category')}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <HelpCircle size={16} />
                    </button>
                  </div>
                  {renderTooltip('category')}
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Produce"
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map(category => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>
                
                {/* Price */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Sale Price
                    </label>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onMouseEnter={() => setActiveTooltip('price')}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <HelpCircle size={16} />
                    </button>
                  </div>
                  {renderTooltip('price')}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                {/* Cost Price */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Cost Price
                    </label>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onMouseEnter={() => setActiveTooltip('cost_price')}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <HelpCircle size={16} />
                    </button>
                  </div>
                  {renderTooltip('cost_price')}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                    <input
                      type="number"
                      name="cost_price"
                      value={formData.cost_price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  {formData.price > 0 && formData.cost_price > 0 && (
                    <div className="mt-1 text-sm">
                      <span className={`font-medium ${
                        calculateProfitMargin() > 20 ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {calculateProfitMargin().toFixed(1)}% margin
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Quantity */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity
                    </label>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onMouseEnter={() => setActiveTooltip('quantity')}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <HelpCircle size={16} />
                    </button>
                  </div>
                  {renderTooltip('quantity')}
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quantity"
                  />
                  {formData.quantity <= 15 && formData.quantity > 0 && (
                    <div className="mt-1 text-sm text-amber-600">
                      Low stock warning threshold: 15 units
                    </div>
                  )}
                </div>
                
                {/* Expiry Date */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onMouseEnter={() => setActiveTooltip('expiry_date')}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <HelpCircle size={16} />
                    </button>
                  </div>
                  {renderTooltip('expiry_date')}
                  <input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Description */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onMouseEnter={() => setActiveTooltip('description')}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <HelpCircle size={16} />
                    </button>
                  </div>
                  {renderTooltip('description')}
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product description, features, and any special handling instructions..."
                  />
                </div>
                
                {/* Image URL */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Image URL (optional)
                    </label>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onMouseEnter={() => setActiveTooltip('image_url')}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <HelpCircle size={16} />
                    </button>
                  </div>
                  {renderTooltip('image_url')}
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image_url && (
                    <div className="mt-2 flex items-center space-x-2">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="h-10 w-10 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100';
                        }}
                      />
                      <span className="text-sm text-gray-500">Image Preview</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(product => {
                const daysUntilExpiry = calculateDaysUntilExpiry(product.expiry_date);
                const stockClass = getStockStatusClass(product.quantity);
                const expiryClass = getExpiryStatusClass(product.expiry_date);
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-10 w-10 object-cover" />
                          ) : (
                            <Package size={18} className="text-gray-500" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(product.price)}</div>
                      <div className="text-xs text-gray-500">Cost: {formatCurrency(product.cost_price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${stockClass}`}>
                        {product.quantity} units
                      </div>
                      {product.quantity <= 15 && (
                        <div className="text-xs text-red-500">
                          {product.quantity <= 5 ? 'Critical' : 'Low'} stock
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${expiryClass}`}>
                        {daysUntilExpiry <= 0 
                          ? 'Expired'
                          : `${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(product.expiry_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No products found
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

export default Inventory;