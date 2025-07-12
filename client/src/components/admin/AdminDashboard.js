import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Users, MessageSquare, CheckCircle, Clock, TrendingUp, Download } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentSwaps, setRecentSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      console.log('API Response:', response); // Debug API response
      setStats(response.stats || {});
      setRecentUsers(Array.isArray(response.recentUsers) ? response.recentUsers.filter(user => user && user._id && user.name && user.email) : []);
      setRecentSwaps(Array.isArray(response.recentSwaps) ? response.recentSwaps.filter(swap => swap && swap._id) : []);
    } catch (error) {
      const errorMessage = error.error || error.message || 'Failed to fetch dashboard data';
      toast.error(errorMessage);
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await api.get('/admin/export', {
        params: { type, format: 'json' },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} data exported successfully`);
    } catch (error) {
      const errorMessage = error.error || error.message || 'Failed to export data';
      toast.error(errorMessage);
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Swaps',
      value: stats?.totalSwaps || 0,
      icon: MessageSquare,
      color: 'bg-green-500',
    },
    {
      title: 'Completed Swaps',
      value: stats?.completedSwaps || 0,
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Swaps',
      value: stats?.pendingSwaps || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage your SkillSwap platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-xl p-3 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Completion Rate</h3>
            <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="font-semibold">{stats?.completionRate || 0}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full shadow-lg transition-all duration-1000 ease-out"
              style={{ width: `${stats?.completionRate || 0}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Overall platform success rate</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Users</h3>
              <button
                onClick={() => handleExport('users')}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 flex items-center text-sm px-4 py-2 rounded-lg transition-all duration-200 font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
            <div className="space-y-4">
              {recentUsers.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent users found.</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                        {user.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Swaps</h3>
              <button
                onClick={() => handleExport('swaps')}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 flex items-center text-sm px-4 py-2 rounded-lg transition-all duration-200 font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
            <div className="space-y-4">
              {recentSwaps.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent swaps found.</p>
              ) : (
                recentSwaps.map((swap) => (
                  <div key={swap._id} className="border-l-4 border-blue-500 pl-4 p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-r-lg hover:from-blue-100 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {swap.requester?.name || 'Unknown'} → {swap.recipient?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-600 mb-1">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-2">
                            {swap.skillOffered || 'N/A'}
                          </span>
                          →
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs ml-2">
                            {swap.skillRequested || 'N/A'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {swap.createdAt ? new Date(swap.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;