import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/dbConnect';
import userRoutes from './routes/v1/Users/index';
import postRoutes from './routes/v1/Posts/index';
import commentRoutes from './routes/v1/Comment/index';
import path from 'path';
dotenv.config();

const app = express();
const port = process.env.PORT|| 9000;

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

app.listen(port, () =>{
   console.log(`Now listening on port ${port}`);
})