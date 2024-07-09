import mongoose from "mongoose";

const Schema = mongoose.Schema;

const storySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], required: true },
  createdAt: { type: Date, default: Date.now, expires: '24h' }, // Story expires after 24 hours
});
const Story = mongoose.model('Story', storySchema);
export default Story;
