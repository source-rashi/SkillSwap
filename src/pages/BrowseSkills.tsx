import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, MessageCircle } from 'lucide-react';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import SkillTag from '../components/Skills/SkillTag';
import Modal from '../components/UI/Modal';
import api from '../utils/api';

interface UserProfile {
  id: string;
  name: string;
  location?: string;
  photo?: string;
  skillsOffered: string[];
  availability: string[];
  rating: number;
  totalSwaps: number;
}

const BrowseSkills: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [swapRequest, setSwapRequest] = useState({
    skillRequested: '',
    skillOffered: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Mock data - replace with API call
  const mockProfiles: UserProfile[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      location: 'San Francisco, CA',
      skillsOffered: ['Photoshop', 'Illustrator', 'UI Design'],
      availability: ['Weekend Mornings', 'Weekday Evenings'],
      rating: 4.8,
      totalSwaps: 15,
    },
    {
      id: '2',
      name: 'Mike Chen',
      location: 'New York, NY',
      skillsOffered: ['Guitar', 'Music Theory', 'Recording'],
      availability: ['Weekday Evenings', 'Weekend Afternoons'],
      rating: 4.9,
      totalSwaps: 22,
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      location: 'Austin, TX',
      skillsOffered: ['Spanish', 'Translation', 'Cooking'],
      availability: ['Weekend Mornings', 'Weekend Evenings'],
      rating: 4.7,
      totalSwaps: 8,
    },
  ];

  useEffect(() => {
    setProfiles(mockProfiles);
  }, []);

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.skillsOffered.some(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    (profile.location && profile.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRequestSwap = (profile: UserProfile, skill: string) => {
    setSelectedProfile(profile);
    setSwapRequest(prev => ({ ...prev, skillRequested: skill }));
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedProfile || !swapRequest.skillRequested || !swapRequest.skillOffered) {
      return;
    }

    setLoading(true);
    try {
      // API call would go here
      console.log('Sending swap request:', {
        targetUserId: selectedProfile.id,
        ...swapRequest,
      });
      
      // Close modal and reset form
      setShowRequestModal(false);
      setSwapRequest({ skillRequested: '', skillOffered: '', message: '' });
      setSelectedProfile(null);
      
      // Show success message (you could use a toast notification)
      alert('Swap request sent successfully!');
    } catch (error) {
      console.error('Error sending swap request:', error);
      alert('Failed to send swap request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Skills</h1>
          <p className="mt-1 text-gray-600">
            Find people who can teach you new skills or share knowledge
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search by skill, name, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                  {profile.location && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">{profile.rating}</span>
                    <span className="mx-1">•</span>
                    <span>{profile.totalSwaps} swaps</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Offered</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.skillsOffered.map((skill, index) => (
                    <button
                      key={index}
                      onClick={() => handleRequestSwap(profile, skill)}
                      className="group"
                    >
                      <SkillTag 
                        skill={skill} 
                        variant="offered"
                      />
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Availability</h4>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{profile.availability.join(', ')}</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedProfile(profile)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or browse all available skills
            </p>
          </div>
        )}

        {/* Request Swap Modal */}
        <Modal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          title="Request Skill Swap"
          size="lg"
        >
          {selectedProfile && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Requesting swap with <strong>{selectedProfile.name}</strong>
                </p>
                {swapRequest.skillRequested && (
                  <p className="text-sm text-gray-600 mt-1">
                    For skill: <strong>{swapRequest.skillRequested}</strong>
                  </p>
                )}
              </div>

              <Input
                label="What skill can you offer in return?"
                value={swapRequest.skillOffered}
                onChange={(e) => setSwapRequest(prev => ({ ...prev, skillOffered: e.target.value }))}
                placeholder="e.g., Web Development, Photography..."
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  value={swapRequest.message}
                  onChange={(e) => setSwapRequest(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Introduce yourself and explain what you'd like to learn..."
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => setShowRequestModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitRequest}
                  loading={loading}
                  className="flex-1"
                  disabled={!swapRequest.skillOffered}
                >
                  Send Request
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default BrowseSkills;