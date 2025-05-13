import express from 'express';
import { createPost, deletePosts, getPosts, getRecommendedPostsUser } from '../controllers/post.controller.js';
import { protectauthRoute } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Routes
router.post('/', protectauthRoute , createPost);
router.get('/', protectauthRoute, getPosts);
router.get('/user', protectauthRoute, getRecommendedPostsUser);
router.delete('/:id', protectauthRoute, deletePosts);

export default router;