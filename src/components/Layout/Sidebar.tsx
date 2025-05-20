import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Lightbulb, 
  MessageSquare, 
  Settings,
  UserCircle
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  text, 
  active, 
  onClick, 
  badge 
}) => {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 my-1 cursor-pointer rounded-md transition-all ${
        active 
          ? 'bg-blue-100 text-blue-900' 
          : 'hover:bg-gray-100 text-gray-700'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <span className={active ? 'text-blue-800' : 'text-gray-500'}>
          {icon}
        </span>
        <span className="ml-3 font-medium">{text}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full text-xs">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const { 
    selectedView, 
    setSelectedView, 
    recommendations, 
    notifications 
  } = useAppContext();
  
  const unreadRecommendations = recommendations.filter(r => !r.isRead).length;
  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  
  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-900">SupermarketAI</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          active={selectedView === 'dashboard'}
          onClick={() => setSelectedView('dashboard')}
        />
        
        <SidebarItem
          icon={<Package size={20} />}
          text="Inventory"
          active={selectedView === 'inventory'}
          onClick={() => setSelectedView('inventory')}
        />
        
        <SidebarItem
          icon={<BarChart3 size={20} />}
          text="Sales"
          active={selectedView === 'sales'}
          onClick={() => setSelectedView('sales')}
        />
        
        <SidebarItem
          icon={<Lightbulb size={20} />}
          text="Recommendations"
          active={selectedView === 'recommendations'}
          onClick={() => setSelectedView('recommendations')}
          badge={unreadRecommendations}
        />
        
        <SidebarItem
          icon={<MessageSquare size={20} />}
          text="AI Assistant"
          active={selectedView === 'assistant'}
          onClick={() => setSelectedView('assistant')}
        />
        
        <div className="mt-8">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Account
          </p>
          
          <SidebarItem
            icon={<UserCircle size={20} />}
            text="Profile"
            active={selectedView === 'profile'}
            onClick={() => setSelectedView('profile')}
          />
          
          <SidebarItem
            icon={<Settings size={20} />}
            text="Settings"
            active={selectedView === 'settings'}
            onClick={() => setSelectedView('settings')}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;