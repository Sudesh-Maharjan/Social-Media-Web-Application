import express from 'express';
import { getMessagesForRoom } from './controller';
import { auth } from '../../../Middleware/auth';

const router = express.Router();

router.get(`/room/:roomId`, auth, getMessagesForRoom);
export default router;