import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, TrendingUp, MessageSquare, Users } from 'lucide-react';
import PostCard from '../components/community/PostCard';
import CreatePostModal from '../components/community/CreatePostModal';
import PostFilters from '../components/community/PostFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0
  });
  const toast = useToast();

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [filters]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/posts?${queryParams}`);
      setPosts(response.posts);
    } catch (error) {
      toast.error('Failed to fetch posts');
      console.error('Fetch posts error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // You can create a separate endpoint for community stats
      const response = await api.get('/posts?limit=1');
      setStats(prevStats => ({
        ...prevStats,
        totalPosts: response.total
      }));
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      const response = await api.post('/posts', postData);
      setPosts(prevPosts => [response.post, ...prevPosts]);
      setIsCreateModalOpen(false);
      toast.success('Post created successfully!');
    } catch (error) {
      const errorMessage = error?.error || error?.message || 'Failed to create post';
      toast.error(errorMessage);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await api.put(`/posts/${postId}/like`);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, ...response.post } : post
        )
      );
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleAddComment = async (postId, comment) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, { content: comment });
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, ...response.post } : post
        )
      );
      toast.success('Comment added successfully!');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleSkillSwapRequest = async (postId, swapData) => {
    try {
      const response = await api.post(`/posts/${postId}/skill-swap`, swapData);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, ...response.post } : post
        )
      );
      toast.success('Skill swap request sent!');
    } catch (error) {
      toast.error('Failed to send skill swap request');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Hub</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share insights, ask questions, and connect with fellow learners
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalPosts}</h3>
                <p className="text-gray-600">Community Posts</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
                <p className="text-gray-600">Active Members</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalComments}</h3>
                <p className="text-gray-600">Total Interactions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters - Full Width Horizontal Layout */}
        <PostFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={() => setFilters({
            type: '',
            category: '',
            search: '',
            sortBy: 'createdAt',
            sortOrder: 'desc'
          })}
        />

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Create Post Button */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              <Plus className="w-5 h-5" />
              Share Your Knowledge
            </button>
          </div>

          <div>
            {/* Posts List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-6">Be the first to share something with the community!</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map(post => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onLike={() => handleLikePost(post._id)}
                    onComment={handleAddComment}
                    onSkillSwap={handleSkillSwapRequest}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <CreatePostModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePost}
        />
      )}
    </div>
  );
};

export default Community;
