import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/dbConnect';
import userRoutes from './routes/v1/Users/index';
import postRoutes from './routes/v1/Posts/index';
import commentRoutes from './routes/v1/Comment/index';
import notificationRoutes from './routes/v1/Notification/index';
import messageRoutes from './routes/v1/Chat/index';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';
import User from './routes/v1/Users/model';
import Message from './routes/v1/Chat/model';
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
   cors: {
      origin: 'http://localhost:5173',
      methods:['GET', 'POST'],
      credentials: true,
   }
})
app.set('socketio', io);
connectDB();
//CORS
app.use(cors({
   origin: 'http://localhost:5173', 
   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
   credentials: true, 
 }));
 
app.use(express.json());
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/notifications', notificationRoutes)
app.use('/api/v1/messages', messageRoutes);
io.on('connection', (socket) =>{
   console.log('A new user has been connected', socket.id);
socket.on('storeSocketId', async(userId: string) => {
   try {
      console.log('User Id:', userId)
      const user = await User.findById(userId);
      if (user) {
        user.socketID = socket.id;
        await user.save();
        console.log(`Socket ID for user ${userId} updated to ${socket.id}`);
      } else {
        console.error(`User with ID ${userId} not found`);
      }
    } catch (err) {
      console.error('Error updating socket ID:', err);
    }
});

   socket.on('startPrivateChat', async(data) => {
     const {recipientId, roomId} = data;
     try {
      const recipient = await User.findById(recipientId);
      if(recipient && recipient.socketID){
        socket.join(roomId);//sender joins the room
        const chatHistory = await Message.find({roomId}).sort({timeStamp: 1});
        console.log('ChatHistory',chatHistory)
        socket.emit('fetchChatHistory', chatHistory);//Emmit chat history to sender
        console.log('Sender joined room:', roomId);
         io.to(recipient.socketID).emit('privateChatStarted', {
          roomId,
            senderId: socket.id
         });
         console.log('Chat Started with:', recipientId)
        
      }else{
         console.error('Recipient not found or not conncted!');
      }
     } catch (error) {
      console.error('Error sending message:', error)
     }
    });
    //Join the room when notified
    socket.on('joinRoom', async(roomId) =>{
      socket.join(roomId);
      const chatHistory = await Message.find({roomId}).sort({timeStamp: 1});
        console.log('ChatHistory',chatHistory)
        socket.emit('fetchChatHistory', chatHistory);
      console.log(`User ${socket.id} joined room ${roomId}`)
    })
  
    socket.on('message', async (msg) => {
      const { message, type, roomId, senderId } = msg;
  //Save message to database
  const newMessage = new Message({
    roomId,
    senderId,
    senderSocketId: socket.id,
    message,
  });
  await newMessage.save();//save message to db
  
      // Emit message based on type
      if (type === 'private') {
        socket.broadcast.to(roomId).emit('message', {
          message,
          senderSocketId: socket.id,
          type,
          roomId,
        });
      } else {
        socket.broadcast.emit('message', {
          message,
          senderSocketId: socket.id,
          type,
        });
      }
    });
   socket.on('typing', (data) => {
      const { type, roomId } = data;
      if (type === 'private') {
        socket.broadcast.to(roomId).emit('typing', { senderId: socket.id, type, roomId });
      } else {
        socket.broadcast.emit('typing', { senderId: socket.id });
      }
    });
    
   socket.on('disconnect',async (reason)=>{
      console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
   });
});


const port = process.env.PORT|| 9000;
server.listen(port, () =>{
   console.log(`Now listening on port ${port}`);
   
})

export {io};
