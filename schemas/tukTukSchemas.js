const Joi = require('joi');

// TukTuk Registration Validation
const tukTukRegisterSchema = Joi.object({
  registrationNumber: Joi.string().required().messages({
    'any.required': 'Registration number is required',
  }),
  ownerName: Joi.string().required().min(2).messages({
    'any.required': 'Owner name is required',
    'string.min': 'Owner name must be at least 2 characters',
  }),
  province: Joi.string().required().messages({
    'any.required': 'Province is required',
  }),
  district: Joi.string().required().messages({
    'any.required': 'District is required',
  }),
  lastKnownLocation: Joi.object({
    latitude: Joi.number().required().min(-90).max(90).messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
    }),
    longitude: Joi.number().required().min(-180).max(180).messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
    }),
  }).required(),
});

// TukTuk Location Update Validation
const updateLocationSchema = Joi.object({
  latitude: Joi.number().required().min(-90).max(90).messages({
    'any.required': 'Latitude is required',
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
  }),
  longitude: Joi.number().required().min(-180).max(180).messages({
    'any.required': 'Longitude is required',
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
  }),
  speed: Joi.number().optional().min(0),
  accuracy: Joi.number().optional().min(0),
});

module.exports = {
  tukTukRegisterSchema,
  updateLocationSchema,
};
