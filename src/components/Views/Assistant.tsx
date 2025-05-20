import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import ChatBubble from '../UI/ChatBubble';
import { Send, Bot, ShoppingCart, AlertCircle, Tag, MessageSquare } from 'lucide-react';

const Assistant: React.FC = () => {
  const { chatMessages, sendChatMessage } = useAppContext();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendChatMessage(message);
      setMessage('');
    }
  };
  
  const handleSampleQuery = (query: string) => {
    setMessage(query);
  };
  
  return (
    <div className="h-[calc(100vh-170px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
        <p className="text-gray-600">Chat with our intelligent assistant for inventory and sales insights</p>
      </div>
      
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {/* Agent Selection */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center px-3 py-1 bg-purple-100 text-purple-900 rounded-full text-sm">
              <Bot size={16} className="mr-1" />
              <span>Master AI</span>
            </div>
            
            <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm">
              <ShoppingCart size={16} className="mr-1" />
              <span>Stock Agent</span>
            </div>
            
            <div className="flex items-center px-3 py-1 bg-green-100 text-green-900 rounded-full text-sm">
              <AlertCircle size={16} className="mr-1" />
              <span>Sales Agent</span>
            </div>
            
            <div className="flex items-center px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-sm">
              <Tag size={16} className="mr-1" />
              <span>Expiry Agent</span>
            </div>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          {chatMessages.map(message => (
            <ChatBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Sample Queries */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">Suggested Questions:</p>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300"
              onClick={() => handleSampleQuery("How many products are low in stock?")}
            >
              How many products are low in stock?
            </button>
            
            <button
              className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300"
              onClick={() => handleSampleQuery("Which products are expiring soon?")}
            >
              Which products are expiring soon?
            </button>
            
            <button
              className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300"
              onClick={() => handleSampleQuery("What are today's sales?")}
            >
              What are today's sales?
            </button>
            
            <button
              className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300"
              onClick={() => handleSampleQuery("Suggest discounts for expiring products")}
            >
              Suggest discounts for expiring products
            </button>
          </div>
        </div>
        
        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ask a question about inventory, sales, or recommendations..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
              disabled={!message.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Assistant;