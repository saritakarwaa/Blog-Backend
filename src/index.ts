import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import AuthRouter from './routes/Auth/user.auth'
import connectDB from './config/db';
import blogRoutes from './routes/Blog/BlogRoutes'
import path from 'path'

// Load environment variables
dotenv.config(); 

// Connect to MongoDB
connectDB();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = ["http://localhost:3000", "https://blog-frontend-umber-seven.vercel.app"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

//Routes
app.use('/auth',AuthRouter)
app.use('/blogs',blogRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
