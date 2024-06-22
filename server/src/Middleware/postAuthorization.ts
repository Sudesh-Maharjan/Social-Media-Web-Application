import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";
import Post from "../routes/v1/Posts/model";

export const checkPostOwnership = async (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.id;
  const userId = (req as any).user?.id;
  if (!isValidObjectId(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.creatorID.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to perform this action" });
    }

    next();
  } catch (error) {
    console.error("Error checking post ownership:", error);
    res.status(500).send("Internal Server Error");
  }
};
