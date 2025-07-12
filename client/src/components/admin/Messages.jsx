import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Send } from 'lucide-react';

const Messages = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSendMessage = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      await api.post('/admin/messages', { title, content });
      toast.success('Platform message sent successfully');
      setTitle('');
      setContent('');
    } catch (error) {
      const errorMessage = error.error || error.message || 'Failed to send message';
      toast.error(errorMessage);
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Send Platform-Wide Message
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter message title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter message content..."
              rows="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={loading}
            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 ${
              loading ? 'cursor-not-allowed' : ''
            }`}
          >
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;