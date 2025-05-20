import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  bgColor?: string;
  textColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  change,
  changeLabel,
  bgColor = 'bg-white',
  textColor = 'text-gray-900'
}) => {
  const renderChange = () => {
    if (change === undefined) return null;
    
    const isPositive = change >= 0;
    const changeClass = isPositive ? 'text-green-600' : 'text-red-600';
    const ChangeIcon = isPositive ? ArrowUp : ArrowDown;
    
    return (
      <div className={`flex items-center ${changeClass} text-sm mt-1`}>
        <ChangeIcon size={14} className="mr-1" />
        <span>{Math.abs(change)}%</span>
        {changeLabel && <span className="ml-1 text-gray-600">{changeLabel}</span>}
      </div>
    );
  };
  
  return (
    <div className={`${bgColor} p-5 rounded-lg shadow-sm border border-gray-200`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className={`text-2xl font-semibold ${textColor} mt-1`}>{value}</h3>
          {renderChange()}
        </div>
        <div className="p-2 rounded-full bg-blue-100 text-blue-800">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;