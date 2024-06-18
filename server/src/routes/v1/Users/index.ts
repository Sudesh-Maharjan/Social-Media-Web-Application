import { Router} from 'express';
import { sendOtp, register, login, getAllUsers, getUserById, getCurrentUser, sendPasswordResetToken, resetPassword, validateResetToken } from './controller';
const router = Router();
import refreshTokenRoute from '../Auth/index'
import { auth } from '../../../Middleware/auth';

router.post('/send-otp', sendOtp);
router.post('/register', register)
router.post('/login', login);
router.get('/allusers',auth, getAllUsers);
// router.get('/:_id', getUser);
router.get('/allusers/:assigneeID',auth , getUserById);
router.get('/profile', auth, getCurrentUser);

router.post('/password/reset/token', sendPasswordResetToken);
router.post('/password/reset', resetPassword);
router.post('/password/validate-token', validateResetToken);

router.use(refreshTokenRoute);

export default router;