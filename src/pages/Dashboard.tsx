import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageCircle, User, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import SkillTag from '../components/Skills/SkillTag';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Mock data for dashboard stats
  const stats = {
    totalSwaps: 12,
    pendingRequests: 3,
    completedSwaps: 9,
    averageRating: 4.8,
  };

  const recentActivity = [
    {
      id: 1,
      type: 'request_received',
      message: 'John Doe wants to learn Photoshop from you',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'swap_completed',
      message: 'Completed guitar lesson with Sarah Smith',
      time: '1 day ago',
    },
    {
      id: 3,
      type: 'request_accepted',
      message: 'Mike Johnson accepted your Spanish lesson request',
      time: '2 days ago',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="mt-1 text-gray-600">
            Here's what's happening with your skill swaps today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card padding="md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Swaps</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSwaps}</p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed Swaps</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedSwaps}</p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/browse" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Skills
                  </Button>
                </Link>
                <Link to="/swaps" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    My Swap Requests
                  </Button>
                </Link>
                <Link to="/profile" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Your Skills */}
            <Card className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Skills</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Skills You Offer</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skillsOffered.map((skill, index) => (
                      <SkillTag key={index} skill={skill} variant="offered" />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Skills You Want</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skillsWanted.map((skill, index) => (
                      <SkillTag key={index} skill={skill} variant="wanted" />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.type === 'request_received' && (
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                      )}
                      {activity.type === 'swap_completed' && (
                        <Star className="h-5 w-5 text-green-600" />
                      )}
                      {activity.type === 'request_accepted' && (
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Start browsing skills to get connected!
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;