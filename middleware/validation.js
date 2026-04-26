// Data validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        type: err.type,
      }));

      return res.status(400).json({
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        details,
      });
    }

    // Attach validated data to request
    req.validatedBody = value;
    next();
  };
};

module.exports = validateRequest;
