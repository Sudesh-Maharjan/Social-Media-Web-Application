import { Request, Response } from "express";
import Post, { Post as PostType } from "./model";
import { StatusCodes } from "http-status-codes";
import { checkPostOwnership } from "../../../Middleware/postAuthorization";

import User from '../Users/model';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
let currentId = 1;

export const createPost = async (req: Request, res: Response) => {
  const { content, tags, status } = req.body;
  const creatorID = (req as any).user?.id;
  const trimmedContent = content.trim();
  if (!content || trimmedContent.length < 3) {
    return res.status(400).send("Title and content are required and cannot be empty or only whitespace.");
  }
  const postStatus = status || "draft";
  try {
    const user = await User.findById(creatorID);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).send("User not found");
    }

    let image = "";
    console.log(req.file)
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
      console.log(req.file.filename)
    }
    const post = new Post({
    id: currentId++,
    content: trimmedContent,
    createDate: new Date(),
    creatorID: creatorID, 
    tags: tags || [],
    status: postStatus,
    comments: [],
    likes: [],
    shares: [],
    image: req.file ? image : undefined,
  });

    const newPost = await post.save();

    const populatedPost = await Post.findById(newPost._id).populate('creatorID', 'firstName lastName');
    const creator = populatedPost?.creatorID as User;
    const formattedCreateDate = newPost.createDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const creatorName = `${creator.firstName} ${creator.lastName}`;
    return res.status(StatusCodes.CREATED).json({
      ...newPost.toObject(),
      creatorName,
      formattedCreateDate,
    });
    
  } catch (error) {
    console.error("Error creating post:", error);
   return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

export const getPosts = async (req: Request, res: Response) => {
  const { tags, search } = req.query;
  const userId = (req as any).user?.id;

  try {
    let query: any = {
      creatorID: userId
    };
    if (tags) {
      const tagsArray = (tags as string).split(',').map(tag => tag.trim());
      query.tags = { $all: tagsArray.map(tag => new RegExp(tag, 'i')) };
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } }
      ];
    }
    const posts = await Post.find(query).populate('creatorID', 'firstName lastName');
  
    const formattedPosts = posts.map(post => {
      const creator = post.creatorID as User;
      const createDate = moment(post.createDate);
      const formattedDate = createDate.format("MMMM D");
      const relativeTime = createDate.fromNow();
      return {
        ...post.toObject(),
        creatorName: `${creator.firstName} ${creator.lastName}`,
         formattedCreateDate: `${formattedDate} (${relativeTime})`
      };
    });
    return res.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal Server Error");
    return;
  }
};

export const getPost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  try {
    await checkPostOwnership(req, res, async () => {
      const post = await Post.findById(postId);
      if (!post) return res.status(404).send("Post not found");
    const imageUrl = `${req.protocol}://${req.get('host')}${post.image}`;

      return res.json({ ...post.toObject(), imageUrl });
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).send("Internal Server Error");
    return;
  }
};

export const updatePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    await checkPostOwnership(req, res, async () => {
      const post = await Post.findById(id);
      if (!post) {
         res.status(StatusCodes.NOT_FOUND).json({ message: "Post not found" });
         return;
      }
      if (req.file) {
        updates.image = `/uploads/${req.file.filename}`;
      }
      delete updates.creatorID;
      const updatedPostData = {
        ...updates,
        status: updates.status || post.status, 
      };
  
      const updatedPost = await Post.findByIdAndUpdate(id, updatedPostData, { new: true });
     return res.json(updatedPost);
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    return;
  }
};
const deleteFile = (filePath: string) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting file: ${filePath}`, err);
    }
  });
};
export const deletePost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = (req as any).user?.id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' });
    }
    if (post.creatorID.toString() !== userId) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'You are not authorized to delete this post' });
    }
    if (post.image) {
      const imagePath = path.join(__dirname, '../../../../../client/socialmedia/public', post.image);
      deleteFile(imagePath);
    }
    await Post.deleteOne({ _id: postId });
   return res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error');
    return;
  }
};

export const likeOrDislikePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // If already liked, unlike the post
      post.likes = post.likes.filter((like) => like.toString() !== userId.toString());
    } else {
      // If not liked, like the post
      post.likes.push(userId);
    }

    await post.save();
    res.json({ message: 'Post like/unlike successful', likes: post.likes });
    return;
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    res.status(500).send('Internal Server Error');
    return;
  }
};

export const sharePost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const userId = (req as any).user?.id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' });
    }

    post.shares.push(userId);
    await post.save();
    res.json({ message: 'Post shared successfully' });
    return;
  } catch (error) {
    console.error('Error sharing post:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error');
    return;
  }
};