import { Router } from 'express';
import { createPost, getPosts, getPost, updatePost, deletePost, likeOrDislikePost, sharePost } from './controller';
import { auth } from '../../../Middleware/auth';
import { checkPostOwnership } from '../../../Middleware/postAuthorization';
import upload from '../../../Middleware/uploadMiddleware';
const router = Router();

router.post('/', auth,upload.single('image'), createPost);
router.get('/', auth, getPosts);
router.get('/:postId', auth, checkPostOwnership, getPost);
router.put('/:postId', auth, checkPostOwnership, upload.single('image'), updatePost);
router.delete('/:postId', auth, checkPostOwnership, deletePost);
router.post('/:postId/like', auth, likeOrDislikePost);
router.post('/:postId/share', auth, sharePost);

export default router;
