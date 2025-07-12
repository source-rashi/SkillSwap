import React from 'react';
import SwapRequestCard from './SwapRequestCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SwapRequestList = ({ 
  requests, 
  pagination, 
  onUpdate, 
  onDelete, 
  onMarkCompleted, 
  onPageChange 
}) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No swap requests found</div>
        <p className="text-gray-400">Start browsing skills to send your first request!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6 mb-8">
        {requests.map((request) => (
          <SwapRequestCard
            key={request._id}
            request={request}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onMarkCompleted={onMarkCompleted}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-2 text-sm text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SwapRequestList;
