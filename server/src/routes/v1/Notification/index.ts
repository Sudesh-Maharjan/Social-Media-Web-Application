import express from 'express';
import { getNotifications, deleteNotification } from './controller';
import { auth } from '../../../Middleware/auth';

const router = express.Router();

router.get('/:userId', auth, getNotifications);

// router.post('/',auth, createNotification)

router.delete('/:id',auth, deleteNotification);

export default router;