import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database";
import taskRoutes from "./routes/task.routes";
import userRoutes from "./routes/user.routes";
import projectRoutes from "./routes/project.routes";
import {errorHandler} from "./middleware/error.middleware";



dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

connectDB();

// Enable CORS for frontend
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173']; // Default to localhost for development

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    // Also allow if origin matches any allowed origin (case-insensitive)
    const isAllowed = allowedOrigins.some(allowed => {
      const allowedLower = allowed.toLowerCase();
      const originLower = origin.toLowerCase();
      return originLower === allowedLower || originLower.startsWith(allowedLower);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}. Allowed origins:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.get("/", (req: Request, res: Response) => {
    res.send("Trullo API");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use(errorHandler);