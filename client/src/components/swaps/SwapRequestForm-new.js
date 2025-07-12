import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Send, X, Calendar, MessageSquare, ArrowRightLeft } from 'lucide-react';

const SwapRequestForm = ({ recipient, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/swaps', {
        ...data,
        recipient: recipient._id
      });
      toast.success('Swap request sent successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to send swap request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-4">
          <ArrowRightLeft className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Send Swap Request to {recipient.name}
        </h3>
        <p className="text-gray-600">
          Connect and learn together through skill exchange
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Skill You're Offering
          </label>
          <select
            {...register('skillOffered', { required: 'Please select a skill to offer' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="">Select a skill you can teach...</option>
            {user?.skillsOffered?.map((skill, index) => (
              <option key={index} value={skill}>
                {skill}
              </option>
            ))}
          </select>
          {errors.skillOffered && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <X className="w-4 h-4 mr-1" />
              {errors.skillOffered.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Skill You Want to Learn
          </label>
          <select
            {...register('skillRequested', { required: 'Please select a skill to learn' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="">Select a skill you want to learn...</option>
            {recipient?.skillsOffered?.map((skill, index) => (
              <option key={index} value={skill}>
                {skill}
              </option>
            ))}
          </select>
          {errors.skillRequested && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <X className="w-4 h-4 mr-1" />
              {errors.skillRequested.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message (Optional)
          </label>
          <textarea
            {...register('message')}
            rows={4}
            placeholder="Introduce yourself and explain what you'd like to learn..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Preferred Date (Optional)
          </label>
          <input
            {...register('scheduledDate')}
            type="datetime-local"
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SwapRequestForm;
