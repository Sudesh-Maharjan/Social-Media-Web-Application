import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
   roomId: {type: String, required: true},
   senderId: {type: String, required: true},
   senderSocketId: {type: String, required: true},
   message: {type: String, required: true},
   timeStamp: {type: Date, default: Date.now},
});

const Message = mongoose.model('Message', messageSchema);

export default Message;