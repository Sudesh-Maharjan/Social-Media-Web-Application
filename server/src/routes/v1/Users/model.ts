import mongoose, { Schema } from "mongoose";

interface User {
  _id: string;
   firstName: string;
   lastName: string;
  email: string;
  password: string;
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  createdPosts: mongoose.Types.ObjectId[];
  likedPosts: mongoose.Types.ObjectId[];
  sharedPosts: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
}

const userSchema: Schema = new Schema({
  firstName: {
    type: String,
    unique: true,
  },
  lastName: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    unique: true,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetToken: {
    type: String,
  },
  resetTokenExpires: {
    type: Date,
  },
  createdPosts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  likedPosts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  sharedPosts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  // Here we are self referencing the user model because 
  // each user document needs to refer to other user documents for follow and unfollow
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const User = mongoose.model<User>("User", userSchema);
export default User;
