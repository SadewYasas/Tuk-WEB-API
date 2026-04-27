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

    // Handle different data types and structures
    if (Array.isArray(data)) {
      // If data is an array, wrap it properly
      response.data = data;
      response.message = 'Data retrieved successfully';
    } else if (data && typeof data === 'object') {
      // For error responses (4xx, 5xx)
      if (!response.success && (data.error || data.message)) {
        // For errors, prefer message over error code
        response.error = data.message || data.error;
        if (data.details) {
          response.details = data.details;
        }
        if (data.data !== undefined) {
          response.data = data.data;
        } else {
          response.data = null;
        }
      } else {
        // For success responses (2xx)
        if (data.message) {
          response.message = data.message;
        }
        
        // Check if data.data contains a formatQueryResponse result
        // formatQueryResponse returns: { data: [...], pagination: {...}, filters: null/obj, sort: null/obj }
        if (data.data && typeof data.data === 'object' && 
            ('pagination' in data.data || 'filters' in data.data || 'sort' in data.data)) {
          // This is a nested formatQueryResponse structure
          const queryResponse = data.data;
          response.data = queryResponse.data;
          if (queryResponse.pagination) {
            response.pagination = queryResponse.pagination;
          }
          if ('filters' in queryResponse) {
            response.filters = queryResponse.filters;
          }
          if ('sort' in queryResponse) {
            response.sort = queryResponse.sort;
          }
        } else if (data.data !== undefined) {
          // Standard case: data.data is the actual data
          response.data = data.data;
        } else if (Object.keys(data).length === 1 && 'message' in data) {
          // Only message, no data
          response.data = null;
        } else {
          // Object without message or data property
          response.data = data;
        }
        
        // Preserve additional top-level properties if not already set
        if (data.pagination && !('pagination' in response)) {
          response.pagination = data.pagination;
        }
        if ('filters' in data && !('filters' in response)) {
          response.filters = data.filters;
        }
        if ('sort' in data && !('sort' in response)) {
          response.sort = data.sort;
        }
      }
    } else {
      response.data = data;
    }

    return originalJson(response);
  };

  next();
};

module.exports = standardizeResponse;
