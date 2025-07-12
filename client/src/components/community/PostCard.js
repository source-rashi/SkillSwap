import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ArrowRight, 
  Clock, 
  Tag,
  User,
  Lightbulb,
  HelpCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const PostCard = ({ post, onLike, onComment, onSkillSwap }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const getTypeIcon = (type) => {
    switch (type) {
      case 'insight':
        return <Lightbulb className="w-4 h-4" />;
      case 'problem':
        return <AlertTriangle className="w-4 h-4" />;
      case 'question':
        return <HelpCircle className="w-4 h-4" />;
      case 'tip':
        return <Zap className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'insight':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'problem':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'question':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'tip':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isLiked = post.likes?.some(like => like.user === user?._id);
  const likeCount = post.likes?.length || 0;
  const commentCount = post.comments?.length || 0;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    if (onComment) {
      await onComment(post._id, newComment);
      setNewComment('');
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
              {post.author?.profileImage ? (
                <img
                  src={post.author.profileImage}
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{post.author?.name}</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center space-x-1 ${getTypeColor(post.type)}`}>
            {getTypeIcon(post.type)}
            <span className="capitalize">{post.type}</span>
          </div>
        </div>

        {/* Title & Content */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
          {post.title}
        </h2>
        
        <p className="text-gray-700 leading-relaxed mb-4">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Category */}
        {post.category && (
          <div className="mb-4">
            <span className="text-sm text-gray-600">
              Category: <span className="font-medium text-gray-900">{post.category}</span>
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={onLike}
              className={`flex items-center space-x-2 text-sm font-medium transition-colors duration-200 ${
                isLiked 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{commentCount}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors duration-200">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {/* Skill Swap Button */}
          {post.author?._id !== user?._id && (
            <button
              onClick={() => onSkillSwap && onSkillSwap(post._id)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <span>Propose Skill Swap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-6 py-4 border-t border-gray-100 bg-white/50">
          {/* Add Comment */}
          <div className="mb-4">
            <div className="flex space-x-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={2}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          {post.comments && post.comments.length > 0 && (
            <div className="space-y-3">
              {post.comments.map((comment) => (
                <div key={comment._id} className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                    {comment.author?.profileImage ? (
                      <img
                        src={comment.author.profileImage}
                        alt={comment.author.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">{comment.author?.name}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
