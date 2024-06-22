import mongoose, { Schema, Types } from "mongoose";

export interface Comment {
  postId: Types.ObjectId;
  comment: string;
  author: Types.ObjectId; 
  createDate: Date;
  updateDate?: Date;
}

const CommentSchema: Schema<Comment> = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  comment: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date },
});

const Comment = mongoose.model<Comment>("Comment", CommentSchema);
export default Comment;
