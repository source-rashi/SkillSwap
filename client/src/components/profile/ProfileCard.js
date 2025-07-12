import React, { useState } from 'react';
import { MapPin, Clock, Star, Eye, MessageSquare } from 'lucide-react';
import SwapRequestForm from '../swaps/SwapRequestForm';
import Modal from '../common/Modal';

const ProfileCard = ({ user, onSwapRequest }) => {
  const [showSwapModal, setShowSwapModal] = useState(false);

  const availabilityColors = {
    flexible: 'bg-green-100 text-green-800',
    weekdays: 'bg-blue-100 text-blue-800',
    weekends: 'bg-purple-100 text-purple-800',
    evenings: 'bg-orange-100 text-orange-800'
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              {user.location && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  {user.location}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {user.rating?.count > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                {user.rating.average.toFixed(1)} ({user.rating.count})
              </div>
            )}
            <div className="flex items-center text-sm text-gray-500">
              <Eye className="w-4 h-4 mr-1" />
              {user.profileViews || 0}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Availability</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${availabilityColors[user.availability] || 'bg-gray-100 text-gray-800'}`}>
              {user.availability || 'Not specified'}
            </span>
          </div>
        </div>

        {user.skillsOffered && user.skillsOffered.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Offered</h4>
            <div className="flex flex-wrap gap-1">
              {user.skillsOffered.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {user.skillsOffered.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{user.skillsOffered.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {user.skillsWanted && user.skillsWanted.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Wanted</h4>
            <div className="flex flex-wrap gap-1">
              {user.skillsWanted.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {user.skillsWanted.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{user.skillsWanted.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowSwapModal(true)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Request Swap
        </button>
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
