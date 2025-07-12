import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Star, Send, X } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const FeedbackForm = ({ swapRequestId, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/swaps/feedback', {
        swapRequestId,
        rating,
        comment: data.comment
      });
      toast.success('Feedback submitted successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStar = (index) => {
    const isFilled = index <= (hoveredRating || rating);
    return (
      <button
        key={index}
        type="button"
        onClick={() => setRating(index)}
        onMouseEnter={() => setHoveredRating(index)}
        onMouseLeave={() => setHoveredRating(0)}
        className={`transition-all duration-200 hover:scale-110 ${
          isFilled 
            ? 'text-yellow-400 hover:text-yellow-500' 
            : 'text-gray-300 hover:text-yellow-300'
        }`}
      >
        <Star 
          className="w-8 h-8" 
          fill={isFilled ? 'currentColor' : 'none'}
        />
      </button>
    );
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl mb-4">
            <Star className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Share Your Experience</h3>
          <p className="text-gray-600">Help others by rating your skill swap experience</p>
        </div>

        {/* Rating */}
        <div className="text-center">
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            How would you rate this experience?
          </label>
          <div className="flex justify-center space-x-2 mb-2">
            {[1, 2, 3, 4, 5].map(renderStar)}
          </div>
          <div className="text-sm text-gray-500">
            {rating === 0 && "Click to rate"}
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Share your thoughts (optional)
          </label>
          <textarea
            {...register('comment')}
            rows={4}
            placeholder="What went well? Any tips for future skill swappers?"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
          />
          {errors.comment && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <X className="w-4 h-4 mr-1" />
              {errors.comment.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || rating === 0}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;
