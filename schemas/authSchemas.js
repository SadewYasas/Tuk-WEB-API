const Joi = require('joi');

// User Registration Validation
const userRegisterSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username must only contain alphanumeric characters',
    'string.min': 'Username must be at least 3 characters',
    'string.max': 'Username must not exceed 30 characters',
    'any.required': 'Username is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be valid',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and numeric characters',
      'any.required': 'Password is required',
    }),
  role: Joi.string()
    .valid('admin', 'police_officer', 'operator')
    .optional()
    .default('police_officer'),
  province: Joi.string().required().messages({
    'any.required': 'Province is required',
  }),
  district: Joi.string().required().messages({
    'any.required': 'District is required',
  }),
});

// User Login Validation
const userLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be valid',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

module.exports = {
  userRegisterSchema,
  userLoginSchema,
};
