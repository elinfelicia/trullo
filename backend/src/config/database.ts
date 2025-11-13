import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

    } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(`MongoDB Connection Error: ${error.message}`);
          if (process.env.NODE_ENV === 'production') {
              console.error('Exiting in production mode due to database connection failure');
              process.exit(1);
          } else {
              console.error('Server will continue but database operations will fail until MongoDB is connected.');
              throw error; // Re-throw so startServer can handle it
          }
        } else {
          console.error('Unknown error occurred');
          if (process.env.NODE_ENV === 'production') {
              process.exit(1);
          }
          throw error;
        }
    }
};

export default connectDB;
