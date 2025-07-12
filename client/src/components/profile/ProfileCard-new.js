import React, { useState } from 'react';
import { MapPin, Clock, Star, Eye, MessageSquare, User } from 'lucide-react';
import SwapRequestForm from '../swaps/SwapRequestForm';
import Modal from '../common/Modal';

const ProfileCard = ({ user, onSwapRequest }) => {
  const [showSwapModal, setShowSwapModal] = useState(false);

  const availabilityColors = {
    flexible: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200',
    weekdays: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200',
    weekends: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200',
    evenings: 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-200'
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
        {/* Header with Gradient Background */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg ring-4 ring-white">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
                {user.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {user.location}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {user.rating?.count > 0 && (
                <div className="flex items-center bg-white rounded-lg px-3 py-1 shadow-sm">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-semibold text-gray-700">
                    {user.rating.average.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({user.rating.count})
                  </span>
                </div>
              )}
              <div className="flex items-center bg-white rounded-lg px-3 py-1 shadow-sm">
                <Eye className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-600">{user.profileViews || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Availability */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Availability
              </span>
              <span className={`px-3 py-1 rounded-xl text-sm font-semibold border ${availabilityColors[user.availability] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {user.availability || 'Not specified'}
              </span>
            </div>
          </div>

          {/* Skills Offered */}
          {user.skillsOffered && user.skillsOffered.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Skills Offered
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.skillsOffered.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 text-sm rounded-lg font-medium border border-blue-200"
                  >
                    {skill}
                  </span>
                ))}
                {user.skillsOffered.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg font-medium border border-gray-200">
                    +{user.skillsOffered.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Skills Wanted */}
          {user.skillsWanted && user.skillsWanted.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Skills Wanted
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.skillsWanted.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm rounded-lg font-medium border border-green-200"
                  >
                    {skill}
                  </span>
                ))}
                {user.skillsWanted.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg font-medium border border-gray-200">
                    +{user.skillsWanted.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Request Swap Button */}
          <button
            onClick={() => setShowSwapModal(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center font-semibold shadow-lg"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Request Swap
          </button>
        </div>
      </div>

      <Modal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        title={`Request Swap with ${user.name}`}
      >
        <SwapRequestForm
          recipient={user}
          onSuccess={() => {
            setShowSwapModal(false);
            if (onSwapRequest) onSwapRequest();
          }}
          onCancel={() => setShowSwapModal(false)}
        />
      </Modal>
    </>
  );
};

export default ProfileCard;
