import React, { useState } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import NotificationDropdown from '../UI/NotificationDropdown';

const Header: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="relative w-96">
        <input
          type="text"
          placeholder="Search products, sales, recommendations..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search 
          size={18} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
        />
      </div>
      
      <div className="flex items-center">
        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-100 relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <NotificationDropdown
              notifications={notifications}
              onReadNotification={markNotificationAsRead}
              onReadAll={markAllNotificationsAsRead}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>
        
        <div className="ml-4 flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-800 flex items-center justify-center text-white">
            <User size={16} />
          </div>
          <span className="ml-2 font-medium text-gray-700">Store Manager</span>
        </div>
      </div>
    </header>
  );
};

export default Header;