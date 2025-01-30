import Joi, { ObjectSchema } from 'joi'; // Import Joi and its types
import httpStatus from 'http-status';
import pick from '../utils/pick';
import ApiError from '../utils/apiError';
import { Request, Response, NextFunction } from 'express'; // Import Express types

/**
 * A middleware function that validates the request body, query, and params using Joi schemas.
 * @param schema The Joi validation schema
 * @returns Middleware function to validate the request
 */
const validate = (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));

  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }

  Object.assign(req, value);
  return next();
};

export default validate;
