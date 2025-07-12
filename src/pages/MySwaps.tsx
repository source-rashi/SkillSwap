import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Star, Trash2 } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import SkillTag from '../components/Skills/SkillTag';

interface SwapRequest {
  id: string;
  type: 'sent' | 'received';
  otherUser: {
    id: string;
    name: string;
    photo?: string;
  };
  skillRequested: string;
  skillOffered: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  rating?: number;
  feedback?: string;
}

const MySwaps: React.FC = () => {
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [selectedSwap, setSelectedSwap] = useState<SwapRequest | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });

  // Mock data - replace with API call
  const mockSwaps: SwapRequest[] = [
    {
      id: '1',
      type: 'received',
      otherUser: { id: '2', name: 'John Doe' },
      skillRequested: 'Photoshop',
      skillOffered: 'Guitar Lessons',
      message: 'Hi! I would love to learn Photoshop from you. I can teach you guitar in return.',
      status: 'pending',
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      type: 'sent',
      otherUser: { id: '3', name: 'Sarah Smith' },
      skillRequested: 'Spanish',
      skillOffered: 'Web Development',
      message: 'Looking to learn Spanish for an upcoming trip!',
      status: 'accepted',
      createdAt: '2024-01-14T15:30:00Z',
    },
    {
      id: '3',
      type: 'received',
      otherUser: { id: '4', name: 'Mike Johnson' },
      skillRequested: 'React',
      skillOffered: 'Photography',
      status: 'completed',
      createdAt: '2024-01-10T09:15:00Z',
      rating: 5,
      feedback: 'Great teacher! Very patient and knowledgeable.',
    },
  ];

  useEffect(() => {
    setSwaps(mockSwaps);
  }, []);

  const filteredSwaps = swaps.filter(swap => swap.type === activeTab);

  const handleAcceptSwap = async (swapId: string) => {
    try {
      // API call would go here
      setSwaps(prev => prev.map(swap => 
        swap.id === swapId ? { ...swap, status: 'accepted' } : swap
      ));
    } catch (error) {
      console.error('Error accepting swap:', error);
    }
  };

  const handleRejectSwap = async (swapId: string) => {
    try {
      // API call would go here
      setSwaps(prev => prev.map(swap => 
        swap.id === swapId ? { ...swap, status: 'rejected' } : swap
      ));
    } catch (error) {
      console.error('Error rejecting swap:', error);
    }
  };

  const handleDeleteSwap = async (swapId: string) => {
    if (window.confirm('Are you sure you want to delete this swap request?')) {
      try {
        // API call would go here
        setSwaps(prev => prev.filter(swap => swap.id !== swapId));
      } catch (error) {
        console.error('Error deleting swap:', error);
      }
    }
  };

  const handleMarkCompleted = async (swapId: string) => {
    try {
      // API call would go here
      setSwaps(prev => prev.map(swap => 
        swap.id === swapId ? { ...swap, status: 'completed' } : swap
      ));
    } catch (error) {
      console.error('Error marking swap as completed:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedSwap) return;

    try {
      // API call would go here
      setSwaps(prev => prev.map(swap => 
        swap.id === selectedSwap.id ? { 
          ...swap, 
          rating: feedback.rating, 
          feedback: feedback.comment 
        } : swap
      ));
      
      setShowFeedbackModal(false);
      setFeedback({ rating: 5, comment: '' });
      setSelectedSwap(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'accepted': return 'text-blue-600';
      case 'rejected': return 'text-red-600';
      case 'completed': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'completed': return <Star className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Swap Requests</h1>
          <p className="mt-1 text-gray-600">
            Manage your incoming and outgoing skill swap requests
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('received')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'received'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Received Requests
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {swaps.filter(s => s.type === 'received').length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'sent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Sent Requests
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {swaps.filter(s => s.type === 'sent').length}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Swap Requests */}
        <div className="space-y-4">
          {filteredSwaps.map((swap) => (
            <Card key={swap.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {swap.otherUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {swap.otherUser.name}
                      </h3>
                      <div className={`flex items-center space-x-1 ${getStatusColor(swap.status)}`}>
                        {getStatusIcon(swap.status)}
                        <span className="text-sm font-medium capitalize">{swap.status}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-sm text-gray-600">Wants to learn:</span>
                      <SkillTag skill={swap.skillRequested} variant="wanted" />
                      <span className="text-sm text-gray-600">Offers:</span>
                      <SkillTag skill={swap.skillOffered} variant="offered" />
                    </div>
                    
                    {swap.message && (
                      <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-3 rounded-lg">
                        "{swap.message}"
                      </p>
                    )}
                    
                    {swap.feedback && (
                      <div className="bg-green-50 p-3 rounded-lg mb-3">
                        <div className="flex items-center space-x-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (swap.rating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">({swap.rating}/5)</span>
                        </div>
                        <p className="text-sm text-gray-700">"{swap.feedback}"</p>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      {new Date(swap.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  {swap.status === 'pending' && swap.type === 'received' && (
                    <>
                      <Button size="sm" onClick={() => handleAcceptSwap(swap.id)}>
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleRejectSwap(swap.id)}
                      >
                        Decline
                      </Button>
                    </>
                  )}
                  
                  {swap.status === 'accepted' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMarkCompleted(swap.id)}
                    >
                      Mark Complete
                    </Button>
                  )}
                  
                  {swap.status === 'completed' && !swap.rating && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        setSelectedSwap(swap);
                        setShowFeedbackModal(true);
                      }}
                    >
                      Leave Feedback
                    </Button>
                  )}
                  
                  {(swap.status === 'pending' && swap.type === 'sent') || swap.status === 'rejected' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteSwap(swap.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredSwaps.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} requests
            </h3>
            <p className="text-gray-500">
              {activeTab === 'received' 
                ? "You haven't received any swap requests yet"
                : "You haven't sent any swap requests yet"
              }
            </p>
          </div>
        )}

        {/* Feedback Modal */}
        <Modal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          title="Leave Feedback"
        >
          {selectedSwap && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                How was your skill swap with <strong>{selectedSwap.otherUser.name}</strong>?
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= feedback.rating 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment (Optional)
                </label>
                <textarea
                  value={feedback.comment}
                  onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience..."
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => setShowFeedbackModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitFeedback}
                  className="flex-1"
                >
                  Submit Feedback
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MySwaps;