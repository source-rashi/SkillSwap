import React, { useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { Calendar, MessageSquare, Check, X, Trash2, Star, User, ArrowRightLeft } from 'lucide-react';
import Modal from '../common/Modal';
import FeedbackForm from './FeedbackForm';

const SwapRequestCard = ({ request, onUpdate, onDelete, onMarkCompleted }) => {
  const { user } = useAuth();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const isRequester = request.requester._id === user._id;
  const isRecipient = request.recipient._id === user._id;
  const otherUser = isRequester ? request.recipient : request.requester;

  const statusColors = {
    pending: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200',
    accepted: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200',
    rejected: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200',
    completed: 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200'
  };

  const handleReject = () => {
    onUpdate(request._id, 'rejected', rejectionReason);
    setShowRejectModal(false);
    setRejectionReason('');
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {otherUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {request.status === 'completed' && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {isRequester ? (
                    <span className="flex items-center">
                      To: {otherUser.name}
                      <ArrowRightLeft className="w-4 h-4 mx-2 text-blue-600" />
                    </span>
                  ) : (
                    <span className="flex items-center">
                      From: {otherUser.name}
                      <ArrowRightLeft className="w-4 h-4 mx-2 text-green-600" />
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(request.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${statusColors[request.status]}`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Skills Exchange */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-xs font-semibold text-gray-500 mb-2">OFFERING</div>
                <div className="text-lg font-bold text-blue-600">{request.skillOffered}</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-xs font-semibold text-gray-500 mb-2">REQUESTING</div>
                <div className="text-lg font-bold text-green-600">{request.skillRequested}</div>
              </div>
            </div>
          </div>

          {/* Message */}
          {request.message && (
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <MessageSquare className="w-5 h-5 text-gray-400 mr-2" />
                <h4 className="text-sm font-semibold text-gray-700">Message</h4>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-blue-500">
                <p className="text-gray-700 leading-relaxed">"{request.message}"</p>
              </div>
            </div>
          )}

          {/* Scheduled Date */}
          {request.scheduledDate && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
              <div className="flex items-center text-green-800">
                <Calendar className="w-5 h-5 mr-2" />
                <span className="font-semibold">Scheduled:</span>
                <span className="ml-2">{format(new Date(request.scheduledDate), 'MMM d, yyyy h:mm a')}</span>
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {request.status === 'rejected' && request.rejectionReason && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
              <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center">
                <X className="w-4 h-4 mr-2" />
                Rejection Reason
              </h4>
              <p className="text-red-700 leading-relaxed">"{request.rejectionReason}"</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6">
          <div className="flex justify-end space-x-3">
            {request.status === 'pending' && isRecipient && (
              <>
                <button
                  onClick={() => onUpdate(request._id, 'accepted')}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center font-medium"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex items-center font-medium"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </button>
              </>
            )}

            {request.status === 'pending' && isRequester && (
              <button
                onClick={() => onDelete(request._id)}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center font-medium"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            )}

            {request.status === 'accepted' && (
              <button
                onClick={() => onMarkCompleted(request._id)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center font-medium"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark Complete
              </button>
            )}

            {request.status === 'completed' && (
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 flex items-center font-medium"
              >
                <Star className="w-4 h-4 mr-2" />
                Leave Feedback
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Swap Request"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-gray-600">
              Please provide a reason for rejecting this swap request. This helps maintain trust in our community.
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Rejection Reason
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Please explain why you're rejecting this request..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowRejectModal(false)}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-medium"
            >
              Reject Request
            </button>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title={`Rate ${otherUser.name}`}
      >
        <FeedbackForm
          swapRequestId={request._id}
          onSuccess={() => setShowFeedbackModal(false)}
          onCancel={() => setShowFeedbackModal(false)}
        />
      </Modal>
    </>
  );
};

export default SwapRequestCard;
