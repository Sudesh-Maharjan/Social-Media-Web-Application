import { Request, Response } from "express";
import Story from './model';


interface AuthenticatedRequest extends Request {
   user?: {
     id: string;
   };
 }
export const addStory = async (req: AuthenticatedRequest, res: Response) => {
  const { mediaType } = req.body;
  const userId = req.user?.id;
//   console.log(mediaUrl, mediaType);
try {
   if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
   if (!req.file) {
     return res.status(400).json({ message: 'No file uploaded' });
   }
   const mediaUrl = `/uploads/${req.file.filename}`;
    const newStory = new Story({
      user: userId,
      mediaUrl,
      mediaType,
    });

    await newStory.save();
    res.status(201).json(newStory);
  } catch (error: any) {
   console.error('Error adding story:', error);
    res.status(500).json({ message: 'Failed to create story', error: error.message });
  }
};

export const getStories = async (req: Request , res: Response) => {
  try {
    const stories = await Story.find().populate('user', 'firstName lastName profilePicture');
    res.status(200).json(stories);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch stories', error: error.message });
  }
};

export const deleteStory = async (req: Request, res: Response) => {
  const storyId = req.params.id;
  try {
    await Story.findByIdAndDelete(storyId);
    res.status(200).json({ message: 'Story deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete story', error: error.message });
  }
};
