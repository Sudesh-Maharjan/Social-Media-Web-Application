import express from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import User from '../Users/model';

const router = express.Router();

router.post('/refresh-token', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.sendStatus(401).json({ message: 'Refresh token is required' });
  }


  try {
    let decoded: JwtPayload;
    if (typeof token === 'string') {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refreshsecret') as JwtPayload;
    } else {
      decoded = token; 
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.sendStatus(401).json({ message: 'User not found' });
    }

    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

export default router;
