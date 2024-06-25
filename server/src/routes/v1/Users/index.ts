import { Router} from 'express';
import { sendOtp, register, login, getAllUsers, getUserById, sendPasswordResetToken, resetPassword, validateResetToken, followUser, unfollowUser, searchUsers } from './controller';
const router = Router();
import refreshTokenRoute from '../Auth/index'
import { auth } from '../../../Middleware/auth';

router.post('/send-otp', sendOtp);
router.post('/register', register)
router.post('/login', login);
router.get('/allusers',auth, getAllUsers);
router.get('/allusers/:id',auth , getUserById);
router.get('/search', auth, searchUsers);

router.post('/password/reset/token', sendPasswordResetToken);
router.post('/password/reset', resetPassword);
router.post('/password/validate-token', validateResetToken);
router.post('/follow', auth, followUser);
router.post('/unfollow', auth, unfollowUser);
router.use(refreshTokenRoute);


export default router;