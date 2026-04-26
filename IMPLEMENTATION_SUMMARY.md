# Advanced Querying Implementation Summary

## Overview

Your TukTuk Tracking API has been enhanced with powerful advanced querying capabilities including **filtering**, **sorting**, and **pagination**. These features make it easy to handle large datasets and provide flexible data access to clients.

## What Was Added

### 1. **New Utility File: `utils/queryBuilder.js`**
   - Core utility module for building filters, sorts, and pagination
   - Reusable functions that can be imported into any route
   - Main function: `executeQuery()` - handles all querying logic
   - Includes type-aware filtering (string search, date ranges, etc.)

### 2. **Updated Routes in `routes/tukTukRoutes.js`**

   **Main GET Route** (`GET /api/tuk-tuks`)
   - Now supports filtering by: `registrationNumber`, `ownerName`, `province`, `district`
   - Sorting by: `registrationNumber`, `ownerName`, `province`, `district`, `createdAt`, `updatedAt`
   - Full pagination support with metadata

   **Province Filter Route** (`GET /api/tuk-tuks/filter/province/:province`)
   - Enhanced with sorting and pagination capabilities

   **District Filter Route** (`GET /api/tuk-tuks/filter/district/:district`)
   - Enhanced with sorting and pagination capabilities

   **Movement History Route** (`GET /api/tuk-tuks/:id/movement-history`)
   - Added pagination support (limit, page)
   - Enhanced sorting (sort by timestamp, speed, accuracy, etc.)
   - Date range filtering preserved and enhanced

### 3. **Documentation Files**

   **ADVANCED_QUERYING.md**
   - Complete API reference guide
   - Parameter explanations and constraints
   - Combined usage examples
   - Response format documentation
   - Best practices and performance tips

   **ADVANCED_QUERYING_EXAMPLES.md**
   - 21+ practical cURL examples
   - Real-world usage scenarios
   - Postman step-by-step instructions
   - Response examples for various cases

### 4. **Test Suite: `tests/advancedQuerying.test.js`**
   - Comprehensive test cases for all features
   - Tests pagination edge cases
   - Tests filtering combinations
   - Tests sorting (single and multiple fields)
   - Tests response format compliance

## Quick Start

### Run Tests
```bash
npm test -- advancedQuerying.test.js
```

### Example Queries

**Get all TukTuks in Bangkok (page 1, 20 per page, sorted by name)**
```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?province=Bangkok&sort=ownerName&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get TukTuks from Sukhumvit district, sorted by registration number (descending)**
```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?district=Sukhumvit&sort=-registrationNumber" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get movement history for last 30 days with pagination**
```bash
curl -X GET "http://localhost:5000/api/tuk-tuks/{id}/movement-history?startDate=2023-12-01&endDate=2024-01-01&page=1&limit=100" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Query Parameters Reference

### Pagination
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 10, max: 100)

### Sorting
- `sort` - Comma-separated fields with optional `-` prefix for descending
- Example: `sort=province,-registrationNumber` → Sort by province ascending, then registration number descending

### Filtering (TukTuk Endpoints)
- `registrationNumber` - Search (case-insensitive)
- `ownerName` - Search (case-insensitive)
- `province` - Exact match
- `district` - Exact match

### Filtering (Movement History)
- `startDate` - Filter from date (ISO 8601)
- `endDate` - Filter until date (ISO 8601)

## Response Format

All paginated endpoints return this structure:

```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": 150,
    "total_pages": 15,
    "has_next": true,
    "has_prev": false
  },
  "filters": {...},
  "sort": {...}
}
```

## Files Modified

1. ✅ `routes/tukTukRoutes.js` - Updated routes with new querying capabilities
2. ✅ Created `utils/queryBuilder.js` - New utility module

## Files Created

1. ✅ `ADVANCED_QUERYING.md` - Complete API documentation
2. ✅ `ADVANCED_QUERYING_EXAMPLES.md` - Practical examples and scenarios
3. ✅ `tests/advancedQuerying.test.js` - Comprehensive test suite

## Key Features

### 🔍 Filtering
- Multiple field filtering with AND logic
- Case-insensitive string search
- Exact matching for specific fields
- Date range queries

### 📊 Sorting
- Single and multi-field sorting
- Ascending and descending order
- Configurable sort fields per endpoint

### 📄 Pagination
- Page-based navigation
- Configurable page size (1-100 records)
- Metadata for UI navigation (has_next, has_prev, total_pages)

### 🎯 Additional Benefits
- Reusable utility functions for future routes
- Type-aware filtering based on field types
- Consistent response format across endpoints
- Comprehensive error handling
- Well-tested and documented

## Usage Patterns

### Pattern 1: Simple Pagination
```
GET /api/tuk-tuks?page=2&limit=25
```

### Pattern 2: Filter Only
```
GET /api/tuk-tuks?province=Bangkok&district=Sukhumvit
```

### Pattern 3: Sort Only
```
GET /api/tuk-tuks?sort=-registrationNumber
```

### Pattern 4: Full Query
```
GET /api/tuk-tuks?province=Bangkok&sort=ownerName&page=1&limit=20
```

## Integration with Frontend

### React/Vue Example
```javascript
// Fetch with advanced querying
const params = new URLSearchParams({
  province: 'Bangkok',
  sort: '-registrationNumber',
  page: 1,
  limit: 20
});

const response = await fetch(`/api/tuk-tuks?${params}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { data, pagination } = await response.json();

// Use pagination for UI
if (pagination.has_next) {
  // Show "Load More" button
}
```

## Performance Considerations

1. **Pagination**: Always paginate large datasets
2. **Filtering**: Apply filters before sorting to reduce data
3. **Indexes**: Create MongoDB indexes on frequently filtered/sorted fields
4. **Page Size**: Default 10 is good for APIs, increase up to 50-100 for reports
5. **Caching**: Consider caching popular queries

## Next Steps

1. ✅ Review `ADVANCED_QUERYING.md` for complete API reference
2. ✅ Check `ADVANCED_QUERYING_EXAMPLES.md` for practical examples
3. ✅ Run tests: `npm test -- advancedQuerying.test.js`
4. ✅ Try queries in Postman or with cURL
5. 📋 Add similar querying to other models (User, etc.) using the same utility

## Extending to Other Models

The query builder is designed to be reusable. To add advanced querying to another model:

```javascript
const { executeQuery, formatQueryResponse } = require('../utils/queryBuilder');

router.get('/', authMiddleware, async (req, res) => {
  const result = await executeQuery(YourModel, req.query, {
    allowedFilters: ['field1', 'field2', 'field3'],
    allowedSort: ['field1', 'field2', 'createdAt'],
    defaultSort: '-createdAt'
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json(formatQueryResponse(result));
});
```

## Support & Documentation

- **Full Documentation**: See `ADVANCED_QUERYING.md`
- **Examples & Scenarios**: See `ADVANCED_QUERYING_EXAMPLES.md`
- **Tests**: See `tests/advancedQuerying.test.js`

## Questions?

Refer to the documentation files for detailed information on:
- All available query parameters
- Response format specifications
- Real-world usage examples
- Best practices and performance tips
