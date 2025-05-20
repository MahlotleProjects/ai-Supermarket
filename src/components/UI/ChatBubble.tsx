import React from 'react';
import { ChatMessage } from '../../types';
import { AlertCircle, ShoppingCart, Tag, MessageSquare, User } from 'lucide-react';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  const getIcon = () => {
    switch (message.sender) {
      case 'user':
        return <User size={16} />;
      case 'stock':
        return <ShoppingCart size={16} />;
      case 'expiry':
        return <Tag size={16} />;
      case 'sales':
        return <AlertCircle size={16} />;
      case 'master':
      case 'system':
      default:
        return <MessageSquare size={16} />;
    }
  };
  
  const getAgentName = () => {
    switch (message.sender) {
      case 'user':
        return 'You';
      case 'stock':
        return 'Stock Agent';
      case 'expiry':
        return 'Expiry Agent';
      case 'sales':
        return 'Sales Agent';
      case 'master':
        return 'Master AI';
      case 'system':
      default:
        return 'System';
    }
  };
  
  const getBubbleStyle = () => {
    if (isUser) {
      return 'bg-blue-600 text-white ml-auto';
    }
    
    switch (message.sender) {
      case 'stock':
        return 'bg-blue-100 text-blue-900';
      case 'expiry':
        return 'bg-amber-100 text-amber-900';
      case 'sales':
        return 'bg-green-100 text-green-900';
      case 'master':
        return 'bg-purple-100 text-purple-900';
      case 'system':
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };
  
  return (
    <div className={`mb-4 max-w-[80%] ${isUser ? 'ml-auto' : 'mr-auto'}`}>
      {!isUser && (
        <div className="flex items-center mb-1 text-sm text-gray-600">
          <span className="mr-1">{getIcon()}</span>
          <span>{getAgentName()}</span>
        </div>
      )}
      
      <div className={`p-3 rounded-lg shadow-sm ${getBubbleStyle()}`}>
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
};

export default ChatBubble;