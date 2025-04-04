const Joi = require("joi"); // Import Joi
const { status: httpStatus } = require("http-status");

const pick = require("../utils/pick");
const ApiError = require("../utils/apiError");
const { Request, Response, NextFunction } = require("express"); // Import Express types

/**
 * A middleware function that validates the request body, query, and params using Joi schemas.
 * @param schema The Joi validation schema
 * @returns Middleware function to validate the request
 */
const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ["params", "query", "body"]);
  const object = pick(req, Object.keys(validSchema));

  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(", ");
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }

  Object.assign(req, value);
  return next();
};

module.exports = validate;
