import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAppContext } from '../../context/AppContext';
import Dashboard from '../Views/Dashboard';
import Inventory from '../Views/Inventory';
import Sales from '../Views/Sales';
import Recommendations from '../Views/Recommendations';
import Assistant from '../Views/Assistant';
import Settings from '../Views/Settings';
import Profile from '../Views/Profile';

const Layout: React.FC = () => {
  const { selectedView } = useAppContext();
  
  const renderContent = () => {
    switch (selectedView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'sales':
        return <Sales />;
      case 'recommendations':
        return <Recommendations />;
      case 'assistant':
        return <Assistant />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Layout;