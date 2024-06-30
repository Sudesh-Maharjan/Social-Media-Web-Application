import mongoose from "mongoose";
export interface Notification {
   recipient: string; 
   message: string;
   type: string;
   createdAt: Date;
 }
 
const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
  },
  message: { type: String, required: true },

  type: { type: String, required: true },
  createdAt: { type: String },
  read: { type: Boolean, default: false },
});

const Notification = mongoose.model<Notification>("Notification", notificationSchema);

export default Notification;
