import { Router } from 'express';
import { createPost, getPosts, getPost, updatePost, deletePost, likeOrDislikePost, sharePost } from './controller';
import { auth } from '../../../Middleware/auth';
import { checkPostOwnership } from '../../../Middleware/postAuthorization';
import upload from '../../../Middleware/uploadMiddleware';
const router = Router();

router.post('/', auth,upload.single('image'), createPost);
router.get('/', auth, getPosts);
router.get('/:id', auth, checkPostOwnership, getPost);
router.put('/:id', auth, checkPostOwnership, upload.single('image'), updatePost);
router.delete('/:id', auth, checkPostOwnership, deletePost);
router.post('/:id/like', auth, likeOrDislikePost);
router.post('/:id/share', auth, sharePost);

export default router;
