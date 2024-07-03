import { Request, Response } from 'express';
import User from './model';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { sendOtpEmail, sendPasswordResetEmail } from './service';
import mongoose from 'mongoose';
import upload from '../../../Middleware/uploadMiddleware';
import multer from 'multer';
import fs from 'fs';
import Notification from '../Notification/model'
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

export const validateEmail = (email: string): boolean => {
  return emailRegex.test(email); // test() methods returns true if it finds a match, else false
};

export const validatePassword = (password: string): boolean => {
  return passwordRegex.test(password);
};

export const sendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).send('Email does not meet the requirements');
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).send('User already exists and is verified');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // generate random otp using random() method
    const otpExpires = new Date(Date.now() + 3600000); // 1 hour

    if (existingUser) {
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();
    } else {
      const newUser = new User({
        email,
        otp,
        otpExpires,
      });
      await newUser.save();
    }

    await sendOtpEmail(email, otp);
    res.status(201).send('OTP sent to email');
  } catch (error) {
    console.error('Error in sending OTP:', error);
    res.status(500).send('Server error');
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password, otp, firstName, lastName } = req.body;

  if (!password) {
    return res.status(400).send('Password is required');
  }
  if (!firstName) {
    return res.status(400).send('First name is required');
  }
  if (firstName.length < 2 || firstName.length > 20) {
    return res.status(400).send('First name must be between 2 and 20 characters');
  }
  if (!lastName) {
    return res.status(400).send('Last name is required');
  }
  if (lastName.length < 3 || lastName.length > 20) {
    return res.status(400).send('Last name must be between 3 and 20 characters');
  }
  if (!validatePassword(password)) {
    return res.status(400).send('Password does not meet requirements. Must have at least 8 characters, one uppercase letter, one lowercase letter, and one number.');
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('User not found');
    
    if (!user.otp || !user.otpExpires || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).send('Invalid or expired OTP');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    user.password = hashedPassword;
    user.firstName = firstName;
    user.lastName = lastName;
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.following = [new mongoose.Types.ObjectId(user._id)]; // follow self by default
    await user.save();
    res.status(201).send('Registration Successful!');
  } catch (error: any) {
    if (error.code === 11000 && error.keyPattern?.firstName === 1) {
      return res.status(400).send('A user with this first name already exists');
    }
    if (error.keyPattern?.lastName === 1) {
      return res.status(400).send('A user with this last name already exists');
    }
    console.error('Error in register:', error);
    res.status(500).send('Server error');
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('User not found');
    if (!user.isVerified) return res.status(400).send('User not verified');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid credentials');

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1h',
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || 'refreshsecret', {
      expiresIn: '7d',
    });

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 3600000 }); // 1 hour expiration
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 604800000 }); // 7 days expiration
    res.status(200).json({ accessToken, refreshToken, user: {id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email , profilePicture: user.profilePicture} });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, 'firstName lastName email');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId)
    .populate('followers', 'firstName lastName')
    .populate('following', 'firstName lastName')
    .populate('likedPosts', 'content');
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  const { query } = req.query;

  try {
    if (!query) {
      return res.status(400).send('Search query is required');
    }

    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } }, 
        { lastName: { $regex: query, $options: 'i' } }, 
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('firstName lastName email');

    res.status(200).json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).send('Internal Server Error');
  }
};
export const sendPasswordResetToken = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }
    const resetToken = jwt.sign({ userId: user._id }, process.env.RESET_TOKEN_SECRET!, { expiresIn: '1h' });
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 3600000);
    await user.save();
    await sendPasswordResetEmail(email, resetToken);
    res.status(200).send('Password reset token sent');
  } catch (error) {
    console.error('Error sending password reset token:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;

  try {
    const user = await User.findOne({ resetToken, resetTokenExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).send('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();
    res.status(200).send('Password reset successful');
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const validateResetToken = async (req: Request, res: Response) => {
  const { resetToken } = req.body;

  try {
    jwt.verify(resetToken, process.env.JWT_SECRET as Secret);
    res.status(200).send('Reset token is valid');
  } catch (error) {
    console.error('Error validating reset token:', error);
    res.status(400).send('Invalid reset token');
  }
};


//Follow and unfollow
export const followUser = async (req: AuthenticatedRequest, res: Response) => {
  const { userIdToFollow} = req.body;
  const userId = req.user?.id;
  if (!userId || !mongoose.Types.ObjectId.isValid(userIdToFollow) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send('Invalid user ID format');
  }
  try {
    const userToFollow = await User.findById(userIdToFollow);
    const currentUser = await User.findById(userId);

    if(!userToFollow || !currentUser){
      return res.status(404).send('User not found');
    }
    if(currentUser.following.includes(userIdToFollow)){
      return res.status(400).send('Already following the user');
    }

    currentUser.following.push(userIdToFollow);
    userToFollow.followers.push(new mongoose.Types.ObjectId(userId));

    await currentUser.save();
    await userToFollow.save();
    
    const notificationMessage = `${currentUser.firstName} ${currentUser.lastName} started following you.`;
    const newNotification = new Notification({
      recipient: userIdToFollow,
      message: notificationMessage,
      type: 'follow',
    });

    await newNotification.save();

    const io = req.app.get('socketio');
    if (!io) {
      throw new Error('Socket.io instance not found');
    }
      io.to(userToFollow.socketID).emit('notification', {
      recipientId: userIdToFollow,
      message: notificationMessage,
      type: 'follow',
    });

    res.status(200).json(currentUser);
  }catch(error: any){
    console.error('Error following user:', error.message); 
    console.error(error.stack); 
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
}

export const unfollowUser = async (req: AuthenticatedRequest, res: Response) =>{
  const {  userIdToUnfollow} = req.body;
  const userId = req.user?.id;

  if (!userId || !mongoose.Types.ObjectId.isValid(userIdToUnfollow) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send('Invalid user ID format');
  }
  try{
    const user = await User.findById(userId);
    const userToUnfollow = await User.findById(userIdToUnfollow);

    if(!user || !userToUnfollow){
      return res.status(404).send('User not found');
    }
    user.following = user.following.filter((id) => id.toString() !== userIdToUnfollow);
    userToUnfollow.followers = userToUnfollow.followers.filter((id) => id.toString() !== userId);

    await user.save();
    await userToUnfollow.save();

    res.status(200).send('Unfollowed successfully');
  }catch(error){
    res.status(500).send('Internal Server Error');
  }
}

export const uploadProfilePicture = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id; // Assuming req.user is set by your auth middleware
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    upload.single('profilePicture')(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(500).json({ message: 'Multer error', error: err });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const imagePath = `/uploads/${file.filename}`;
      try {
        await User.findByIdAndUpdate(userId, { profilePicture: imagePath }, { new: true });
        res.status(200).json({ message: 'Profile picture uploaded successfully', imagePath });
      } catch (error: any) {
        console.error('Error updating user with profile picture:', error);
        res.status(500).json({ message: 'Failed to update user with profile picture', error: error.message });
      }
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Unexpected error occurred', error: error.message });
  }
};
export const deleteProfilePicture = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract profile picture path from user document
    const profilePicturePath = user.profilePicture;

    if (!profilePicturePath) {
      return res.status(400).json({ message: 'No profile picture to delete' });
    }

    // Delete file from storage (assuming local file system)
    fs.unlinkSync(profilePicturePath);

    // Update user document to clear profile picture field
    user.profilePicture = undefined;
    await user.save();

    res.status(200).json({ message: 'Profile picture deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting profile picture:', error);
    res.status(500).json({ message: 'Failed to delete profile picture', error: error.message });
  }
};