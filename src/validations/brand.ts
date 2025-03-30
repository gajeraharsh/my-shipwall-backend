import Joi from 'joi';
import { IBrandBody } from '../types/IBrand';

const createBrandValidation = Joi.object<IBrandBody>({
    brandName: Joi.string().required().messages({
        'string.base': 'Brand name must be a string.',
        'any.required': 'Brand name is required.',
    }),
    pageTitle: Joi.string().messages({
        'string.base': 'Page title must be a string.',
    }),
    metaDescription: Joi.string().messages({
        'string.base': 'Meta description must be a string.',
    }),
    metaKeywords: Joi.string().messages({
        'string.base': 'Meta keywords must be a string.',
    }),
    displayHome: Joi.boolean().messages({
        'boolean.base': 'Display home must be a boolean value.',
    }),
});

const updateBrandValidation = Joi.object({
    brandName: Joi.string().optional().messages({
        'string.base': 'Brand name must be a string.',
    }),
    pageTitle: Joi.string().optional().messages({
        'string.base': 'Page title must be a string.',
    }),
    metaDescription: Joi.string().optional().messages({
        'string.base': 'Meta description must be a string.',
    }),
    metaKeywords: Joi.string().optional().messages({
        'string.base': 'Meta keywords must be a string.',
    }),
    displayHome: Joi.boolean().optional().messages({
        'boolean.base': 'Display home must be a boolean value.',
    }),
});

const deleteBrandValidation = Joi.object({
    id: Joi.string().required().messages({
        'string.base': 'Brand ID must be a string.',
        'any.required': 'Brand ID is required.',
    }),
});

const getBrandValidation = Joi.object({
    id: Joi.string().required().messages({
        'string.base': 'Brand ID must be a string.',
        'any.required': 'Brand ID is required.',
    }),
});

const updateBrandOrderValidation = Joi.object({
    ids: Joi.array().required(),
});


export { createBrandValidation, updateBrandValidation, deleteBrandValidation, getBrandValidation, updateBrandOrderValidation };
