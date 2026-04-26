// Middleware to standardize API responses
const standardizeResponse = (req, res, next) => {
  // Store original response methods
  const originalJson = res.json.bind(res);

  // Override res.json to standardize all responses
  res.json = function (data) {
    const response = {
      success: res.statusCode >= 200 && res.statusCode < 300,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    };

    // If data is an error object or has error properties
    if (data && (data.message || data.error)) {
      response.error = data.error || data.message;
      if (data.details) {
        response.details = data.details;
      }
      if (!response.success && data.data === undefined) {
        response.data = null;
      } else if (data.data !== undefined) {
        response.data = data.data;
      }
    } else if (Array.isArray(data)) {
      // If data is an array, wrap it properly
      response.data = data;
      response.message = 'Data retrieved successfully';
    } else if (data && typeof data === 'object') {
      // If it's an object with data property, use it
      if (data.data !== undefined) {
        response.data = data.data;
      } else if (data.message) {
        response.message = data.message;
        response.data = data;
      } else {
        response.data = data;
      }
      if (data.message) {
        response.message = data.message;
      }
      if (data.pagination) {
        response.pagination = data.pagination;
      }
    } else {
      response.data = data;
    }

    return originalJson(response);
  };

  next();
};

module.exports = standardizeResponse;
