import { Request, Response } from "express";
import Post from "../Posts/model";
import { StatusCodes } from "http-status-codes";
import Comment from '../Comment/model';
import mongoose from 'mongoose';

export const addComment = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { comment } = req.body;
  const author = (req as any).user?.id;

  if (!comment || !author) {
    return res.status(StatusCodes.BAD_REQUEST).send("Comment and Author are required");
  }

  try {
    let newComment = await Comment.create({ postId, comment, author });
    newComment =await newComment.populate('author', 'firstName lastName');
    await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });
    res.status(StatusCodes.CREATED).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

export const getComments = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Post not found" });
    }

    const comments = await Comment.find({ postId }).populate('author', 'firstName lastName');
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

export const updateComment = async (req: Request, res: Response) => {
  const { postId, commentId } = req.params;
  const { comment } = req.body;
  const userId = (req as any).user?.id;

  try {
    const commentToUpdate = await Comment.findById(commentId);
    if (!commentToUpdate) {
      return res.status(StatusCodes.NOT_FOUND).send("Comment not found");
    }
    if (!commentToUpdate.postId.equals(postId)) {
      return res.status(StatusCodes.BAD_REQUEST).send("Comment does not belong to post");
    }
    if (!commentToUpdate.author.equals(userId)) {
      return res.status(StatusCodes.FORBIDDEN).send("You are not authorized to update this comment");
    }
    commentToUpdate.comment = comment;
    commentToUpdate.updateDate = new Date();
    await commentToUpdate.save();

    await commentToUpdate.populate('author', 'firstName lastName');
    res.json(commentToUpdate);
  } catch (error: any) {
    console.error("Error updating comment:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
}

export const deleteComment = async (req: Request, res: Response) => {
  const { postId, commentId } = req.params;
  const userId = (req as any).user.id;

  try {
      if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(StatusCodes.BAD_REQUEST).send("Invalid postId or commentId");
      }
    const comment = await Comment.findById(commentId).populate('author', 'firstName lastName');
    if (!comment) {
      return res.status(StatusCodes.NOT_FOUND).send("Comment not found");
    }
    if (!comment.postId.equals(postId)) {
      return res.status(StatusCodes.BAD_REQUEST).send("Comment does not belong to post");
    }
    if (!comment.author.equals(userId)) {
      return res.status(StatusCodes.FORBIDDEN).send("You are not authorized to delete this comment");
    }
    await Comment.deleteOne({ _id: commentId });
    await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });
    res.json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
}
