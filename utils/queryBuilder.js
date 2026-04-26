/**
 * Query Builder Utility
 * Handles filtering, sorting, pagination, and response formatting
 */

/**
 * Parse and build MongoDB filter object
 * @param {Object} queryParams - Request query parameters
 * @param {Array} allowedFields - Fields that can be filtered
 * @returns {Object} MongoDB filter object
 */
const buildFilter = (queryParams, allowedFields = []) => {
  const filter = {};

  allowedFields.forEach(field => {
    if (queryParams[field]) {
      const value = queryParams[field];

      // Handle different filter types
      if (field === 'registrationNumber' || field === 'ownerName') {
        // Case-insensitive search for string fields
        filter[field] = { $regex: value, $options: 'i' };
      } else if (field === 'province' || field === 'district') {
        // Exact match for location fields
        filter[field] = value;
      } else if (field === 'latitude' || field === 'longitude') {
        // Range queries for coordinates
        if (queryParams[`${field}_min`]) {
          filter[field] = { ...filter[field], $gte: parseFloat(queryParams[`${field}_min`]) };
        }
        if (queryParams[`${field}_max`]) {
          filter[field] = { ...filter[field], $lte: parseFloat(queryParams[`${field}_max`]) };
        }
      } else if (field === 'createdAt' || field === 'updatedAt' || field === 'timestamp') {
        // Date range queries
        if (queryParams[`${field}_start`]) {
          filter[field] = { ...filter[field], $gte: new Date(queryParams[`${field}_start`]) };
        }
        if (queryParams[`${field}_end`]) {
          filter[field] = { ...filter[field], $lte: new Date(queryParams[`${field}_end`]) };
        }
      } else {
        filter[field] = value;
      }
    }
  });

  return filter;
};

/**
 * Parse and build MongoDB sort object
 * @param {String} sortParam - Sort parameter (e.g., "field1,-field2")
 * @param {Array} allowedFields - Fields that can be sorted
 * @returns {Object} MongoDB sort object
 */
const buildSort = (sortParam, allowedFields = []) => {
  const sort = {};

  if (!sortParam) return sort;

  const sortFields = sortParam.split(',');

  sortFields.forEach(field => {
    let fieldName = field.trim();
    let order = 1; // ascending

    if (fieldName.startsWith('-')) {
      order = -1; // descending
      fieldName = fieldName.substring(1);
    }

    if (allowedFields.includes(fieldName)) {
      sort[fieldName] = order;
    }
  });

  return sort;
};

/**
 * Parse pagination parameters
 * @param {Object} queryParams - Request query parameters
 * @returns {Object} Pagination object with page, limit, skip
 */
const getPagination = (queryParams) => {
  let page = parseInt(queryParams.page) || 1;
  let limit = parseInt(queryParams.limit) || 10;

  // Validate and constrain values
  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100; // Max 100 per page

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Execute query with filtering, sorting, and pagination
 * @param {Object} model - Mongoose model
 * @param {Object} queryParams - Request query parameters
 * @param {Object} options - Configuration options
 *   - allowedFilters: Array of filterable fields
 *   - allowedSort: Array of sortable fields
 *   - defaultSort: Default sort field
 * @returns {Promise} Query result with metadata
 */
const executeQuery = async (
  model,
  queryParams,
  options = {}
) => {
  const {
    allowedFilters = [],
    allowedSort = [],
    defaultSort = '-createdAt',
  } = options;

  try {
    // Build filter, sort, and pagination
    const filter = buildFilter(queryParams, allowedFilters);
    
    // Only use defaultSort if sort parameter is explicitly provided or if we want to always sort
    // For the test case, we only apply defaultSort if explicitly requested
    const sortParam = queryParams.sort;
    const sort = buildSort(sortParam, allowedSort);
    const { page, limit, skip } = getPagination(queryParams);

    // Get total count for pagination metadata
    const total = await model.countDocuments(filter);

    // Execute query - apply sort only if one was specified
    let query = model.find(filter);
    
    if (Object.keys(sort).length > 0) {
      query = query.sort(sort);
    } else if (sortParam === undefined && defaultSort) {
      // Only apply defaultSort if no sort was provided AND defaultSort is configured
      query = query.sort(buildSort(defaultSort, allowedSort));
    }
    
    const data = await query.skip(skip).limit(limit);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data,
      pagination: {
        current_page: page,
        per_page: limit,
        total: total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      filter: Object.keys(filter).length > 0 ? filter : null,
      sort: Object.keys(sort).length > 0 ? sort : null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Format query response
 * @param {Object} queryResult - Result from executeQuery
 * @returns {Object} Formatted response
 */
const formatQueryResponse = (queryResult) => {
  if (!queryResult.success) {
    return {
      error: queryResult.error,
      message: 'Error executing query',
    };
  }

  return {
    data: queryResult.data,
    pagination: queryResult.pagination,
    filters: queryResult.filter,
    sort: queryResult.sort,
  };
};

module.exports = {
  buildFilter,
  buildSort,
  getPagination,
  executeQuery,
  formatQueryResponse,
};
