import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import SwapRequestList from '../components/swaps/SwapRequestList';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const toast = useToast();

  useEffect(() => {
    fetchRequests();
  }, [activeTab, pagination.currentPage]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {
        type: activeTab,
        page: pagination.currentPage,
        limit: 10
      };

      const response = await api.get('/swaps', { params });
      setRequests(response.swapRequests);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        total: response.total
      });
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestUpdate = async (requestId, status, rejectionReason = '') => {
    try {
      const response = await api.put(`/swaps/${requestId}`, { status, rejectionReason });
      toast.success(`Request ${status} successfully`);
      fetchRequests();
    } catch (error) {
      const errorMessage = error?.error || error?.message || 'Failed to update request';
      toast.error(errorMessage);
    }
  };

  const handleRequestDelete = async (requestId) => {
    try {
      await api.delete(`/swaps/${requestId}`);
      toast.success('Request deleted successfully');
      fetchRequests();
    } catch (error) {
      const errorMessage = error?.error || error?.message || 'Failed to delete request';
      toast.error(errorMessage);
    }
  };

  const handleMarkCompleted = async (requestId) => {
    try {
      await api.put(`/swaps/${requestId}/complete`);
      toast.success('Swap marked as completed');
      fetchRequests();
    } catch (error) {
      const errorMessage = error?.error || error?.message || 'Failed to mark as completed';
      toast.error(errorMessage);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Requests' },
    { id: 'sent', label: 'Sent' },
    { id: 'received', label: 'Received' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Swap Requests
        </h1>
        <p className="text-gray-600">
          Manage your skill swap requests and offers
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <SwapRequestList
          requests={requests}
          pagination={pagination}
          onUpdate={handleRequestUpdate}
          onDelete={handleRequestDelete}
          onMarkCompleted={handleMarkCompleted}
          onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
        />
      )}
    </div>
  );
};

export default Requests;
