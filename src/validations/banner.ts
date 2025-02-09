import Joi from 'joi';
import { IBannerBody } from '../types/IBanner';

const createBannerValidation = Joi.object<IBannerBody>({
    bannerName: Joi.string().required().messages({
        "any.required": "Banner name is required",
    }),
    link: Joi.string().uri().optional().allow(null, ''),
    bannerImage: Joi.string().optional(),
}).or("link", "bannerImage").messages({
    "object.missing": "Either link or bannerImage is required",
});

const updateBannerValidation = Joi.object({
    bannerName: Joi.string().min(3).max(50).required().messages({
        "string.base": "Banner name must be a string",
        "string.empty": "Banner name cannot be empty",
        "string.min": "Banner name should be at least 3 characters",
        "string.max": "Banner name should be at most 50 characters",
        "any.required": "Banner name is required"
    }),
    link: Joi.string().uri().optional().messages({
        "string.uri": "Link must be a valid URL"
    }),
    bannerImage: Joi.string().uri().optional().messages({
        "string.uri": "Banner image must be a valid URL"
    }),

});

const deleteBannerValidation = Joi.object({
    id: Joi.string().required().messages({
        'string.base': 'Banner ID must be a string.',
        'any.required': 'Banner ID is required.',
    }),
});

const getBannerValidation = Joi.object({
    id: Joi.string().required().messages({
        'string.base': 'Banner ID must be a string.',
        'any.required': 'Banner ID is required.',
    }),
});

export { createBannerValidation, updateBannerValidation, deleteBannerValidation, getBannerValidation };
