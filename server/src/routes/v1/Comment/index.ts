import { Router } from 'express';
import { addComment, updateComment, deleteComment, getComments } from './controller';
import { auth } from '../../../Middleware/auth';
import { checkPostOwnership } from '../../../Middleware/postAuthorization';

const router = Router();

router.post('/:postId/comments', auth, addComment);
router.get('/:postId/comments', auth, getComments);
router.put('/:postId/comments/:commentId', auth,checkPostOwnership, updateComment);
router.delete('/:postId/comments/:commentId', auth, checkPostOwnership, deleteComment);

export default router;
