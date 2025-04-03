import Joi from 'joi';

const createStateValidation = Joi.object({
    name: Joi.string().required().messages({
        'string.base': 'State name must be a string.',
        'any.required': 'State name is required.',
    }),
});

const updateStateValidation = Joi.object({
    name: Joi.string().optional().messages({
        'string.base': 'State name must be a string.',
    }),
});

const deleteStateValidation = Joi.object({
    id: Joi.string().required().messages({
        'string.base': 'State ID must be a string.',
        'any.required': 'State ID is required.',
    }),
});

const getStateValidation = Joi.object({
    id: Joi.string().required().messages({
        'string.base': 'State ID must be a string.',
        'any.required': 'State ID is required.',
    }),
});


const createCityValidation = Joi.object({
    name: Joi.string().required().messages({
        'string.base': 'City name must be a string.',
        'any.required': 'City name is required.',
    }),
    state: Joi.string().required().messages({
        'string.base': 'State ID must be a string.',
        'any.required': 'State ID is required.',
    }),
});

const updateCityValidation = Joi.object({
    name: Joi.string().optional().messages({
        'string.base': 'City name must be a string.',
    }),
    state: Joi.string().optional().messages({
        'string.base': 'State ID must be a string.',
    }),
});

const deleteCityValidation = Joi.object({
    id: Joi.string().required().messages({
        'string.base': 'City ID must be a string.',
        'any.required': 'City ID is required.',
    }),
});

const getCityValidation = Joi.object({
    id: Joi.string().required().messages({
        'string.base': 'City ID must be a string.',
        'any.required': 'City ID is required.',
    }),
});

const createIncentiveValidation = Joi.object({
    minAmount: Joi.number().required().messages({
        'number.base': 'Minimum amount must be a number.',
        'any.required': 'Minimum amount is required.',
    }),
    maxAmount: Joi.number().required().greater(Joi.ref('minAmount')).messages({
        'number.base': 'Maximum amount must be a number.',
        'any.required': 'Maximum amount is required.',
        'number.greater': 'Maximum amount must be greater than minimum amount.',
    }),
    incentivePercentage: Joi.number().required().min(0).max(100).messages({
        'number.base': 'Incentive percentage must be a number.',
        'any.required': 'Incentive percentage is required.',
        'number.min': 'Incentive percentage must be at least 0.',
        'number.max': 'Incentive percentage cannot exceed 100.',
    }),
});

const updateIncentiveValidation = Joi.object({
    minAmount: Joi.number().optional().messages({
        'number.base': 'Minimum amount must be a number.',
    }),
    maxAmount: Joi.number().optional().greater(Joi.ref('minAmount')).messages({
        'number.base': 'Maximum amount must be a number.',
        'number.greater': 'Maximum amount must be greater than minimum amount.',
    }),
    incentivePercentage: Joi.number().optional().min(0).max(100).messages({
        'number.base': 'Incentive percentage must be a number.',
        'number.min': 'Incentive percentage must be at least 0.',
        'number.max': 'Incentive percentage cannot exceed 100.',
    }),
});

const deleteIncentiveValidation = Joi.object({
    id: Joi.string().required().messages({
        'string.base': 'Incentive ID must be a string.',
        'any.required': 'Incentive ID is required.',
    }),
});

const getIncentiveValidation = Joi.object({
    id: Joi.string().required().messages({
        'string.base': 'Incentive ID must be a string.',
        'any.required': 'Incentive ID is required.',
    }),
});

export { createStateValidation, updateStateValidation, deleteStateValidation, getStateValidation, createCityValidation, updateCityValidation, deleteCityValidation, getCityValidation, createIncentiveValidation, updateIncentiveValidation, deleteIncentiveValidation, getIncentiveValidation };
