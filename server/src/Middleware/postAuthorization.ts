import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";
import Post from "../routes/v1/Posts/model";
import Comment from "../routes/v1/Comment/model";
export const checkPostOwnership = async (req: Request, res: Response, next: NextFunction) => {
  const {postId} = req.params;
  const commentId = req.params.commentId;
  console.log(commentId)
  const userId = (req as any).user?.id;
  console.log('post id:',postId)
  if (!isValidObjectId(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (commentId) {
      if (!isValidObjectId(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to perform this action on this comment" });
    }
  } else if (post.creatorID.toString() !== userId) {
    return res.status(403).json({ message: "You are not authorized to perform this action on this post" });
  }
    next();
  } catch (error) {
    console.error("Error checking post ownership:", error);
    res.status(500).send("Internal Server Error");
  }
};
