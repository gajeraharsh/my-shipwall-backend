import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import brandRoutes from './routes/brandRoutes';
import ApiError from './utils/apiError';
import cookieParser from 'cookie-parser'

dotenv.config();  // Load environment variables from .env file

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser())


// MongoDB connection
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/brand', brandRoutes);

const errorHandler = (
    err: ApiError,  // Explicitly typing the error as ApiError
    req: Request,
    res: Response,
    next: NextFunction
): Response => {  // Explicit return type
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            errorDetails: err.error,  // Include the error details (custom property of ApiError)
        });
    }

    // Fallback to a generic error handler for any unhandled errors
    return res.status(500).json({
        status: 'error',
        message: 'An unexpected error occurred',
    });
};

// @ts-ignore
app.use(errorHandler);

export default app;
