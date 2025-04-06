import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import AuthRouter from './routes/Auth/user.auth'
import connectDB from './config/db';
import blogRoutes from './routes/Blog/BlogRoutes'

// Load environment variables
dotenv.config(); 

// Connect to MongoDB
connectDB();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true
}));
app.use(express.json());

//Routes
app.use('/auth',AuthRouter)
app.use('/blogs',blogRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
