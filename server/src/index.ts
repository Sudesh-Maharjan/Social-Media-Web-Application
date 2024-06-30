import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/dbConnect';
import userRoutes from './routes/v1/Users/index';
import postRoutes from './routes/v1/Posts/index';
import commentRoutes from './routes/v1/Comment/index';
import notificationRoutes from './routes/v1/Notification/index';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';
import User from './routes/v1/Users/model';
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
     const {recipientId, message} = data;
     try {
      const recipient = await User.findById(recipientId);
      if(recipient && recipient.socketID){
         io.to(recipient.socketID).emit('newMessage', {
            message,
            senderId: socket.id,
         });
      }else{
         console.error('Recipient not found or not conncted!');
      }
     } catch (error) {
      console.error('Error sending message:', error)
     }
    });
  
    socket.on('message', (msg) => {
      const { message, type, recipientId, groupId } = msg;
  
      // Emit message based on type
      if (type === 'private') {
        io.to(recipientId).emit('message', {
          message,
          senderId: socket.id,
          type,
          recipientId,
        });
      } else if (type === 'group') {
        io.to(groupId).emit('message', {
          message,
          senderId: socket.id,
          type,
          groupId,
        });
      } else {
        socket.broadcast.emit('message', {
          message,
          senderId: socket.id,
          type,
        });
      }
    });
   socket.on('typing', (data) => {
      const { type, recipientId, roomId } = data;
      if (type === 'private') {
        io.to(roomId).emit('typing', { senderId: socket.id, type, roomId });
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
