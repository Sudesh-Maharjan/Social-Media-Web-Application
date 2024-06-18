import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/dbConnect';
import userRoutes from './routes/v1/Users/index';
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

app.use('/api/v1/users', userRoutes);

app.listen(port, () =>{
   console.log(`Now listening on port ${port}`);
})