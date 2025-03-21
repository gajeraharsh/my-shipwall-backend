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
import contactusRoute from './routes/contactusRoute';

import appSettingRoutes from './routes/seller/AppSettingRoutes';
import roleRoute from './routes/seller/RoleRoute';
import saleUserRoute from './routes/seller/saleUserRoutes';
import customerRoute from './routes/seller/customerRoute';
import adminUserRotue from './routes/seller/AdminUserRotue';



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
app.use('/api/support', supportRoutes);
app.use('/api/contact', contactusRoute)
app.use('/api/web', webRoutes)

app.use("/api/seller/setting", appSettingRoutes)
app.use("/api/seller/admin-role", roleRoute)
app.use("/api/seller/sale-member", saleUserRoute)
app.use("/api/seller/admin-users", adminUserRotue)
app.use("/api/seller/customers", customerRoute)




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
