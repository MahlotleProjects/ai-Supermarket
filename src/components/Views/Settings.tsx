import React from 'react';
import { Settings as SettingsIcon, Database, Bell, User, HardDrive, Globe } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your SupermarketAI Assistant</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">System Settings</h2>
          <p className="text-sm text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {/* Data Management */}
          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-start">
              <div className="p-2 rounded-md bg-blue-100 text-blue-800">
                <Database size={20} />
              </div>
              
              <div className="ml-4 flex-1">
                <h3 className="text-md font-medium text-gray-900">Data Management</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Configure database settings and manage data synchronization
                </p>
                
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                    Backup Data
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">
                    Import Data
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notification Settings */}
          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-start">
              <div className="p-2 rounded-md bg-amber-100 text-amber-800">
                <Bell size={20} />
              </div>
              
              <div className="ml-4 flex-1">
                <h3 className="text-md font-medium text-gray-900">Notification Settings</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Configure how and when you receive notifications about inventory and sales
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Low Stock Alerts</p>
                      <p className="text-xs text-gray-500">Receive alerts when products are running low</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:translate-x-[-100%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Expiry Alerts</p>
                      <p className="text-xs text-gray-500">Get notified about soon-to-expire products</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:translate-x-[-100%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Sales Reports</p>
                      <p className="text-xs text-gray-500">Receive daily sales reports via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:translate-x-[-100%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* AI Assistant Settings */}
          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-start">
              <div className="p-2 rounded-md bg-green-100 text-green-800">
                <SettingsIcon size={20} />
              </div>
              
              <div className="ml-4 flex-1">
                <h3 className="text-md font-medium text-gray-900">AI Assistant Settings</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Configure how the AI assistant analyzes your data and makes recommendations
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recommendation Frequency
                    </label>
                    <select className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="high">High (Several times a day)</option>
                      <option value="medium" selected>Medium (Daily)</option>
                      <option value="low">Low (Weekly)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Threshold
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value="10"
                        className="w-full md:w-64"
                      />
                      <span className="text-sm text-gray-600">10 days</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Suggest discounts for products expiring within this timeframe
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Account Settings */}
          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-start">
              <div className="p-2 rounded-md bg-purple-100 text-purple-800">
                <User size={20} />
              </div>
              
              <div className="ml-4 flex-1">
                <h3 className="text-md font-medium text-gray-900">Account Settings</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Manage your account and user preferences
                </p>
                
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;