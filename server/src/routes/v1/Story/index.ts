import {Router} from 'express';
import { auth } from '../../../Middleware/auth';
import { addStory, getStories, deleteStory } from './controller';
import upload from '../../../Middleware/uploadMiddleware';

const router = Router();

// Add a new story
router.post('/', auth,upload.single('mediaUrl'), addStory);

// Get all stories
router.get('/', auth, getStories);

router.delete('/:id', auth, deleteStory);

export default router;

