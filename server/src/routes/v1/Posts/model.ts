import mongoose, { Schema, Document } from "mongoose";
import  User  from "../Users/model";
export interface Post extends Document {
  id: string;
  content: string;
  creatorID: mongoose.Types.ObjectId | User;
  tags: string[];
  status: "draft" | "published";
  comments: mongoose.Types.ObjectId[];
  likes: mongoose.Types.ObjectId[];
  shares: mongoose.Types.ObjectId[];
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema<Post> = new Schema({
  content: {
    type: String,
    required: true,
    minlength: 1,
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
    required: function () {
      return this.content.length === 0;
    },
  },
},
{
  timestamps: true,
});
export type PostDocument = Post & Document;
const Post = mongoose.model<PostDocument>("Post", PostSchema);
export default Post;
