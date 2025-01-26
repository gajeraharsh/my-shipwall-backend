import Joi from 'joi';
import { IUserBody } from '../types/IUser';

const userValidationSchema = Joi.object<IUserBody>({
    userName: Joi.string().when('role', {
        is: Joi.valid('sale_admin', 'sale_member'),
        then: Joi.required().messages({
            'string.base': 'Username must be a string.',
            'any.required': 'Username is required for sale_admin or sale_member role.',
        }),
        otherwise: Joi.optional(),
    }),
    logginId: Joi.string().when('role', {
        is: Joi.valid('sale_admin', 'sale_member', 'admin'),
        then: Joi.required().messages({
            'string.base': 'Login ID must be a string.',
            'any.required': 'Login ID is required for sale_admin, sale_member, or admin role.',
        }),
        otherwise: Joi.optional(),
    }),
    email: Joi.string().email().required().messages({
        'string.base': 'Email must be a string.',
        'string.email': 'Please provide a valid email address.',
        'any.required': 'Email is required.',
    }),
    phone: Joi.string().required().messages({
        'string.base': 'Phone number must be a string.',
        'any.required': 'Phone number is required.',
    }),
    profileImage: Joi.string().optional().messages({
        'string.base': 'Profile image must be a string.',
    }),
    businessName: Joi.string().when('role', {
        is: 'user',
        then: Joi.optional(),
        otherwise: Joi.required().messages({
            'string.base': 'Business name must be a string.',
            'any.required': 'Business name is required for roles other than user.',
        }),
    }),
    gstNumber: Joi.string().when('role', {
        is: 'user',
        then: Joi.optional(),
        otherwise: Joi.required().messages({
            'string.base': 'GST number must be a string.',
            'any.required': 'GST number is required for roles other than user.',
        }),
    }),
    role: Joi.string().valid('admin', 'user', 'sale_admin', 'sale_member').required().messages({
        'string.base': 'Role must be a string.',
        'any.required': 'Role is required.',
        'any.only': 'Role must be one of "admin", "user", "sale_admin", or "sale_member".',
    }),
    password: Joi.string().required().messages({
        'string.base': 'Password must be a string.',
        'any.required': 'Password is required.',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'string.base': 'Confirm Password must be a string.',
        'any.required': 'Confirm Password is required.',
        'any.only': 'Confirm Password must match the Password.',
    }),
});


const userValidationLoginSchema = Joi.object({
    phone: Joi.string().optional(),
    userName: Joi.string().optional(),
    logginId: Joi.string().optional(),
    password: Joi.string().required(), // Always required
    role: Joi.string().required()
}).or('phone', 'userName', 'logginId'); // Ensures at least one of these is provided


export {
    userValidationSchema,
    userValidationLoginSchema
};
