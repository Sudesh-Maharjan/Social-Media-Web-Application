import { Request, Response } from "express";
import Post, { PostDocument } from "./model";
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
    return res.status(400).send("Content is required and cannot be empty or whitespace.");
  }
  const postStatus = status || "draft";
  try {
    const user = await User.findById(creatorID);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).send("User not found");
    }

    let image = "";
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
      console.log(req.file.filename)
    }
    const newPost = await Post.create({
    content: trimmedContent,
    creatorID: creatorID, 
    tags: tags || [],
    status: postStatus,
    comments: [],
    likes: [],
    shares: [],
    image: req.file ? image : undefined,
  }) as PostDocument;

    await newPost.populate('creatorID', 'firstName lastName');
    const creator = newPost?.creatorID as User;
    const formattedCreateDate = newPost.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
    const user = await User.findById(userId).populate('following');
    if(!user){
      return res.status(StatusCodes.NOT_FOUND).send("User not found");
    }
    const followingIds = user.following.map(followedUser => followedUser._id);
    followingIds.push(userId);
    let query: any = {
      creatorID: { $in: followingIds}
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
    const posts = await Post.find(query).populate('creatorID', 'firstName lastName profilePicture').sort({ createDate: -1 });
  
    const formattedPosts = posts.map((post: PostDocument) => {
      const creator = post.creatorID as User;
      const formattedDate = moment(post.createdAt).format("MMMM D");
      const relativeTime = moment(post.createdAt).fromNow();
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
      const post = await Post.findById(postId).populate('creatorID', 'firstName lastName profilePicture');
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
  const { postId } = req.params;
  const updates = req.body;

  try {
    await checkPostOwnership(req, res, async () => {
      const post = await Post.findById(postId).populate('creatorID', 'firstName lastName');
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
  
      const updatedPost = await Post.findByIdAndUpdate(postId, updatedPostData, { new: true });
      if (updatedPost) {
        await updatedPost.populate('creatorID', 'firstName lastName');
        return res.json(updatedPost);
      } else {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Post not found" });
      }
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
  const {postId} = req.params;
  const userId = (req as any).user?.id;
const commentId = req.params.commentId;
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
    await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId} });
    await Post.deleteOne({ _id: postId });
   return res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error');
    return;
  }
};

export const likeOrDislikePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const userId = (req as any).user?.id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // If already liked, unlike the post
      post.likes = post.likes.filter((like) => like.toString() !== userId.toString());
      await post.save();
      return res.json({ message: 'Post unliked', liked: false });
    } else {
      // If not liked, like the post
      post.likes.push(userId);
      await post.save();
      return res.json({ message: 'Post liked', liked: true });
    }
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
