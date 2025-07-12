import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProfileList from '../components/profile/ProfileList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Search, Filter, Users, Eye, EyeOff, Megaphone, X } from 'lucide-react';

const Browse = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [dismissedMessages, setDismissedMessages] = useState(() => {
    const saved = localStorage.getItem('dismissedMessages');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    skill: '',
    availability: '',
    location: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchMessages();
  }, [filters, pagination.currentPage]);

  useEffect(() => {
    localStorage.setItem('dismissedMessages', JSON.stringify(dismissedMessages));
  }, [dismissedMessages]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 12,
        ...filters
      };
      
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await api.get('/users', { params });
      setUsers(Array.isArray(response.users) ? response.users.filter(u => u && u.name && u.email) : []);
      setPagination({
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        total: response.total || 0
      });
    } catch (error) {
      const errorMessage = error.error || error.message || 'Failed to fetch users';
      toast.error(errorMessage);
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get('/admin/messages');
      setMessages(Array.isArray(response.messages) ? response.messages : []);
    } catch (error) {
      const errorMessage = error.error || error.message || 'Failed to fetch platform messages';
      toast.error(errorMessage);
      console.error('Error fetching messages:', error);
    }
  };

  const handleDismissMessage = (messageId) => {
    setDismissedMessages(prev => [...prev, messageId]);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      skill: '',
      availability: '',
      location: ''
    });
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Privacy Status Notification */}
        {user && (
          <div className="absolute top-4 right-4 max-w-sm p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
            <div className="flex items-center">
              {user.isPublic ? (
                <>
                  <Eye className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Profile: Public</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Profile: Private</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Browse Skills
          </h1>
          <p className="text-gray-600">
            Discover talented individuals ready to share their expertise and grow together
          </p>
        </div>

        {/* Platform Messages */}
        {messages.length > 0 && (
          <div className="mb-6">
            {messages
              .filter(message => !dismissedMessages.includes(message._id))
              .map((message) => (
                <div
                  key={message._id}
                  className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4 relative"
                >
                  <button
                    onClick={() => handleDismissMessage(message._id)}
                    className="absolute top-2 right-2 text-blue-600 hover:text-blue-800"
                    aria-label="Dismiss message"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex items-center">
                    <Megaphone className="w-5 h-5 text-blue-500 mr-2" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800">
                        {message.title} <span className="text-xs text-blue-600">
                          by {message.sender?.name || 'Admin'} on {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </h4>
                      <p className="text-sm text-blue-700">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Filter className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Find Your Perfect Match</h2>
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or skill..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Skill Category
              </label>
              <select
                value={filters.skill}
                onChange={(e) => handleFilterChange('skill', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">All Skills</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="business">Business</option>
                <option value="languages">Languages</option>
                <option value="music">Music</option>
                <option value="sports">Sports</option>
                <option value="cooking">Cooking</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Any Time</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="evenings">Evenings</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Location
              </label>
              <input
                type="text"
                placeholder="City, Country"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    {pagination.total} Skills Available
                  </h3>
                  <div className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ProfileList 
                  users={users} 
                  onPageChange={handlePageChange}
                  pagination={pagination}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse;