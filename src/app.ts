import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import brandRoutes from './routes/brandRoutes';
import categoryRoutes from './routes/categoryRoutes';
import seriesRoutes from './routes/seriesRoutes';
import productRoutes from './routes/productRoutes';
import fileUploadsRoutes from './routes/fileUploads3Routes';
import bannerRouttes from './routes/bannerRouttes';

import colorMasterRoutes from './routes/colorMasterRoutes';
import hsnCodeRoutes from './routes/hsnCodeRoutes';
import generalSettingRoutes from './routes/generalSettingRoutes';
import supportRoutes from './routes/supportRoutes';

import webRoutes from './routes/webRoutes';


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
app.use('/api/category', categoryRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/product', productRoutes);
app.use('/api/filesUpload', fileUploadsRoutes);
app.use('/api/banner', bannerRouttes);
app.use('/api/hsn-code', hsnCodeRoutes);
app.use('/api/color-master', colorMasterRoutes);
app.use('/api/general-setting', generalSettingRoutes);
app.use('/api/support', generalSettingRoutes);
app.use('/api/web', webRoutes)



const errorHandler = (
    err: ApiError,  // Explicitly typing the error as ApiError
    req: Request,
    res: Response,
    next: NextFunction
): Response => {  // Explicit return type
    console.log(err)

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
        err
    });
};

// @ts-ignore
app.use(errorHandler);

export default app;
