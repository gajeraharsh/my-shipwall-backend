import Joi from 'joi';
import { IGeneralSettingBody } from '../types/IGeneralSetting';

const createValidation = Joi.object<IGeneralSettingBody>({
    generalshippingcost: Joi.string().optional().messages({
        'string.base': 'Color name must be a string.',
        'any.required': 'Color name is required.',
    }),
    returnDays: Joi.string().optional()
});


export { createValidation };
