const express = require('express');
const {
  createPost,
  getPosts,
  getPostById,
  toggleLikePost,
  addComment,
  toggleLikeComment,
  requestSkillSwap,
  respondToSkillSwap,
  deletePost
} = require('../controllers/postController');
const { validatePost, validateComment, validateSkillSwapRequest } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Post routes
router.post('/', auth, validatePost, createPost);
router.get('/', auth, getPosts);
router.get('/:id', auth, getPostById);
router.put('/:id/like', auth, toggleLikePost);
router.delete('/:id', auth, deletePost);

// Comment routes
router.post('/:id/comments', auth, validateComment, addComment);
router.put('/:postId/comments/:commentId/like', auth, toggleLikeComment);

// Skill swap routes
router.post('/:id/skill-swap', auth, validateSkillSwapRequest, requestSkillSwap);
router.put('/:postId/skill-swap/:requestId', auth, respondToSkillSwap);

module.exports = router;
