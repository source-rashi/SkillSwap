const Post = require('../models/Post');
const User = require('../models/User');

// Create a new post
const createPost = async (req, res) => {
  try {
    const { title, content, type, category, tags } = req.body;
    
    const post = new Post({
      author: req.user._id,
      title,
      content,
      type,
      category,
      tags: tags || []
    });

    await post.save();
    await post.populate('author', 'name profileImage');
    
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// Get all posts with filters
const getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      tag,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isActive: true };

    // Add filters
    if (type) query.type = type;
    if (category) query.category = { $regex: category, $options: 'i' };
    if (tag) query.tags = { $in: [tag] };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const posts = await Post.find(query)
      .populate('author', 'name profileImage')
      .populate('comments.author', 'name profileImage')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// Get single post by ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name profileImage skillsOffered skillsWanted')
      .populate('comments.author', 'name profileImage')
      .populate('skillSwapRequests.requester', 'name profileImage');

    if (!post || !post.isActive) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

// Like/Unlike a post
const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.findIndex(like => like.user.toString() === userId.toString());

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({ user: userId });
    }

    await post.save();
    await post.populate('author', 'name profileImage');

    res.json({ 
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      post,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

// Add comment to post
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = {
      author: req.user._id,
      content,
      likes: []
    };

    post.comments.push(comment);
    await post.save();
    await post.populate('comments.author', 'name profileImage');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({ 
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Like/Unlike a comment
const toggleLikeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const userId = req.user._id;
    const likeIndex = comment.likes.findIndex(like => like.user.toString() === userId.toString());

    if (likeIndex > -1) {
      // Unlike
      comment.likes.splice(likeIndex, 1);
    } else {
      // Like
      comment.likes.push({ user: userId });
    }

    await post.save();

    res.json({
      message: likeIndex > -1 ? 'Comment unliked' : 'Comment liked',
      isLiked: likeIndex === -1,
      likeCount: comment.likes.length
    });
  } catch (error) {
    console.error('Toggle comment like error:', error);
    res.status(500).json({ error: 'Failed to toggle comment like' });
  }
};

// Request skill swap from post
const requestSkillSwap = async (req, res) => {
  try {
    const { skillOffered, skillWanted, message } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user already has a pending request
    const existingRequest = post.skillSwapRequests.find(
      request => request.requester.toString() === req.user._id.toString() && 
                request.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending swap request for this post' });
    }

    const swapRequest = {
      requester: req.user._id,
      skillOffered,
      skillWanted,
      message,
      status: 'pending'
    };

    post.skillSwapRequests.push(swapRequest);
    await post.save();
    await post.populate('skillSwapRequests.requester', 'name profileImage');

    const newRequest = post.skillSwapRequests[post.skillSwapRequests.length - 1];

    res.status(201).json({
      message: 'Skill swap request sent successfully',
      request: newRequest
    });
  } catch (error) {
    console.error('Request skill swap error:', error);
    res.status(500).json({ error: 'Failed to send skill swap request' });
  }
};

// Respond to skill swap request
const respondToSkillSwap = async (req, res) => {
  try {
    const { postId, requestId } = req.params;
    const { status } = req.body; // 'accepted' or 'declined'
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the post author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only post author can respond to swap requests' });
    }

    const swapRequest = post.skillSwapRequests.id(requestId);
    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    swapRequest.status = status;
    await post.save();

    res.json({
      message: `Skill swap request ${status}`,
      request: swapRequest
    });
  } catch (error) {
    console.error('Respond to skill swap error:', error);
    res.status(500).json({ error: 'Failed to respond to skill swap request' });
  }
};

// Delete post (soft delete)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the post author or admin
    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    post.isActive = false;
    await post.save();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  toggleLikePost,
  addComment,
  toggleLikeComment,
  requestSkillSwap,
  respondToSkillSwap,
  deletePost
};
