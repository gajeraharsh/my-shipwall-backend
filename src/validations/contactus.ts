import Joi from 'joi';
import { IContactUs } from '../types/IContactUs';

const createContactValidation = Joi.object<IContactUs>({
    name: Joi.string().required().messages({
        'string.base': 'Name must be a string.',
        'any.required': 'Name is required.',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address.',
        'any.required': 'Email is required.',
    }),
    subject: Joi.string().required().messages({
        'string.base': 'Subject must be a string.',
        'any.required': 'Subject is required.',
    }),
    message: Joi.string().required().messages({
        'string.base': 'Message must be a string.',
        'any.required': 'Message is required.',
    }),
});

const updateContactValidation = Joi.object({
    name: Joi.string().optional().messages({
        'string.base': 'Name must be a string.',
    }),
    email: Joi.string().email().optional().messages({
        'string.email': 'Email must be a valid email address.',
    }),
    subject: Joi.string().optional().messages({
        'string.base': 'Subject must be a string.',
    }),
    message: Joi.string().optional().messages({
        'string.base': 'Message must be a string.',
    }),
});

const deleteContactValidation = Joi.object({
    id: Joi.string().required().messages({
        'string.base': 'Contact ID must be a string.',
        'any.required': 'Contact ID is required.',
    }),
});

const getContactValidation = Joi.object({
    id: Joi.string().required().messages({
        'string.base': 'Contact ID must be a string.',
        'any.required': 'Contact ID is required.',
    }),
});

export { createContactValidation, updateContactValidation, deleteContactValidation, getContactValidation };
