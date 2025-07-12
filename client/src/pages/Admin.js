import React, { useState } from 'react';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserManagement from '../components/admin/UserManagement';
import SwapMonitoring from '../components/admin/SwapMonitoring';
import Messages from '../components/admin/Messages';
import { BarChart3, Users, MessageSquare, Megaphone } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'swaps', label: 'Swaps', icon: MessageSquare },
    { id: 'messages', label: 'Messages', icon: Megaphone }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'swaps':
        return <SwapMonitoring />;
      case 'messages':
        return <Messages />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage users, monitor swaps, send messages, and view platform analytics
        </p>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {renderContent()}
    </div>
  );
};

export default Admin;