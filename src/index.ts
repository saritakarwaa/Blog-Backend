import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import AuthRouter from './routes/Auth/user.auth'
import connectDB from './config/db';

// Load environment variables
dotenv.config(); 

// Connect to MongoDB
connectDB();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use('/auth',AuthRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
