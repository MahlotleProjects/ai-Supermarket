import React from 'react';
import { Notification } from '../../types';
import { formatDate } from '../../utils/helpers';
import { Info, AlertTriangle, AlertCircle, CheckCircle, X } from 'lucide-react';

interface NotificationDropdownProps {
  notifications: Notification[];
  onReadNotification: (id: string) => void;
  onReadAll: () => void;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onReadNotification,
  onReadAll,
  onClose
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info size={16} className="text-blue-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };
  
  const getBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-white';
    
    switch (type) {
      case 'info':
        return 'bg-blue-50';
      case 'warning':
        return 'bg-amber-50';
      case 'error':
        return 'bg-red-50';
      case 'success':
        return 'bg-green-50';
      default:
        return 'bg-white';
    }
  };
  
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 border border-gray-200">
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium">Notifications</h3>
        <div className="flex items-center">
          <button
            className="text-xs text-blue-600 hover:text-blue-800"
            onClick={onReadAll}
          >
            Mark all as read
          </button>
          <button 
            className="ml-2 text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-3 border-b border-gray-100 cursor-pointer ${getBgColor(
                notification.type,
                notification.isRead
              )}`}
              onClick={() => onReadNotification(notification.id)}
            >
              <div className="flex">
                <div className="mr-3">{getIcon(notification.type)}</div>
                <div className="flex-1">
                  <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(notification.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;