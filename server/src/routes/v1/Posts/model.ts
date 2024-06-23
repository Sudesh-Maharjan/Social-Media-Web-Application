import mongoose, { Schema } from "mongoose";
import  User  from "../Users/model";
export interface Post {
  id: number;
  content: string;
  createDate: Date;
  updateDate?: Date;
  creatorID: mongoose.Types.ObjectId | User;
  tags: string[];
  status: "draft" | "published";
  comments: mongoose.Types.ObjectId[];
  likes: mongoose.Types.ObjectId[];
  shares: mongoose.Types.ObjectId[];
  image?: string;
}

const PostSchema: Schema<Post> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createDate: {
    type: Date,
    default: Date.now,
  },
  updateDate: {
    type: Date,
  },
  creatorID: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tags: {
    type: [String],
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    required: true,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  shares: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  image: {
    type: String,
  },
});

const Post = mongoose.model<Post>("Post", PostSchema);
export default Post;
