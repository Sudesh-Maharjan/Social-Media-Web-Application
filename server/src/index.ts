import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/dbConnect';
import userRoutes from './routes/v1/Users/index';
import postRoutes from './routes/v1/Posts/index';
import commentRoutes from './routes/v1/Comment/index';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';

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

io.on('connection', (socket) =>{
   console.log('A new user has been connected', socket.id);

   socket.on('join', (roomId: string, selectedUsers: string[]) => {
      console.log(`User ${socket.id} joining room: ${roomId}`);
      socket.join(roomId);
      
      if (selectedUsers && Array.isArray(selectedUsers)) {
         selectedUsers.forEach((userId: string) => {
            if (roomId.startsWith("group_chat")) {
               socket.to(roomId).emit('roomCreated', { userId, roomId });
            } else {
               socket.to(userId).emit('roomCreated', { userId, roomId });
            }
         });
      }
    });
   socket.on("notification" , (data) => {
      io.emit('notification', data);
      console.log('Notification sent to: ', data.receiver);
   })
   socket.on('message', (msg)=>{
      const message = {
         message: msg.message,
         senderId: socket.id,
         type:msg.type,
         recipientId: msg.recipientId,
         groupId: msg.groupId,
      }
      console.log('A new user message:', message);
      //logic for selection of private chat or group chat
      if(msg.type === 'private'){
         io.to(msg.recipientId).emit('message', message);
         io.to(msg.recipientId).emit('openChat', message);//open chat
      }else if(msg.type === 'group'){
         socket.to(msg.groupId).emit('message', message);
         io.to(msg.groupId).emit('openChat', message);
      }else{
         socket.broadcast.emit('message', message);
      }
   })
   socket.on('typing', (data) => {
      const {type, recipientId, groupId} = data;
      if(type === 'private'){
         socket.to(recipientId).emit('typing', {senderId: socket.id, type, recipientId});
      }else if(type === 'group'){
         socket.to(groupId).emit('typing', {senderId: socket.id, type, groupId});
      }else{
      socket.broadcast.emit('typing', {senderId: socket.id});
      }
   })
   socket.on('disconnect', (reason)=>{
      console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
   });
});


const port = process.env.PORT|| 9000;
server.listen(port, () =>{
   console.log(`Now listening on port ${port}`);
})

export {io};
