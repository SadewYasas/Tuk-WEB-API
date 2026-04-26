# Advanced Querying Guide

This document explains how to use the advanced querying features (filtering, sorting, and pagination) in the TukTuk Tracking API.

## Overview

The API now supports:
- **Filtering**: Search and filter records by multiple fields
- **Sorting**: Sort results by one or multiple fields in ascending or descending order
- **Pagination**: Navigate through large result sets with page-based navigation

## Query Parameters

### Pagination Parameters

- **`page`** (optional, default: 1): The page number to retrieve
- **`limit`** (optional, default: 10, max: 100): Number of records per page

**Example:**
```
GET /api/tuk-tuks?page=1&limit=20
```

### Sorting Parameters

- **`sort`** (optional, default: varies by endpoint): Comma-separated list of fields to sort by
  - Prefix a field with `-` for descending order
  - Example: `sort=-updatedAt,registrationNumber`

**Available sort fields for tuk-tuks:**
- `registrationNumber`
- `ownerName`
- `province`
- `district`
- `createdAt`
- `updatedAt`

**Example:**
```
GET /api/tuk-tuks?sort=-updatedAt,registrationNumber
```

### Filtering Parameters

#### TukTuk Endpoints

**String fields (case-insensitive search):**
- `registrationNumber`: Search for registration numbers
- `ownerName`: Search for owner names

**Exact match fields:**
- `province`: Filter by province
- `district`: Filter by district

**Examples:**

Filter by province:
```
GET /api/tuk-tuks?province=Bangkok
```

Search for registration number (case-insensitive):
```
GET /api/tuk-tuks?registrationNumber=ABC123
```

Filter by multiple fields:
```
GET /api/tuk-tuks?province=Bangkok&district=Sukhumvit
```

#### Movement History Endpoint

**Date range filtering:**
- `startDate`: Filter records from this date (ISO 8601 format)
- `endDate`: Filter records until this date (ISO 8601 format)

**Examples:**

Get movement history from a specific date range:
```
GET /api/tuk-tuks/{id}/movement-history?startDate=2024-01-01&endDate=2024-01-31
```

Get movement history with pagination:
```
GET /api/tuk-tuks/{id}/movement-history?page=1&limit=50
```

Sort by speed (most recent first):
```
GET /api/tuk-tuks/{id}/movement-history?sort=-timestamp&page=1&limit=50
```

## Combined Usage Examples

### Example 1: Get TukTuks with Multiple Filters and Pagination

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?province=Bangkok&district=Sukhumvit&page=1&limit=20&sort=-registrationNumber" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "registrationNumber": "BKK-9999",
      "ownerName": "John Doe",
      "province": "Bangkok",
      "district": "Sukhumvit",
      "lastKnownLocation": {
        "latitude": 13.7563,
        "longitude": 100.5018,
        "timestamp": "2024-01-15T10:30:00Z"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  },
  "filters": {
    "province": "Bangkok",
    "district": "Sukhumvit"
  },
  "sort": {
    "registrationNumber": -1
  }
}
```

### Example 2: Search TukTuk by Owner Name with Pagination

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?ownerName=John&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 3: Get All TukTuks Sorted by Owner Name (Ascending)

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?sort=ownerName&page=1&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 4: Get Movement History with Date Range and Pagination

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks/507f1f77bcf86cd799439011/movement-history?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=100&sort=-timestamp" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "tukTuk": "BKK-9999",
  "history": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "tukTukId": "507f1f77bcf86cd799439011",
      "latitude": 13.7563,
      "longitude": 100.5018,
      "speed": 45,
      "accuracy": 5,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 100,
    "total": 500,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  },
  "filters": {
    "timestamp": {
      "$gte": "2024-01-01T00:00:00.000Z",
      "$lte": "2024-01-31T23:59:59.999Z"
    }
  },
  "sort": {
    "timestamp": -1
  }
}
```

### Example 5: Get TukTuks by Province with Advanced Sorting

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks/filter/province/Bangkok?sort=-createdAt,ownerName&page=1&limit=25" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Response Format

All paginated responses include:

```json
{
  "data": [],           // Array of results
  "pagination": {
    "current_page": 1,  // Current page number
    "per_page": 10,     // Records per page
    "total": 150,       // Total records matching filters
    "total_pages": 15,  // Total number of pages
    "has_next": true,   // Whether there's a next page
    "has_prev": false   // Whether there's a previous page
  },
  "filters": {},        // Applied filters (null if none)
  "sort": {}            // Applied sort (null if none)
}
```

## Pagination Best Practices

1. **Handling Large Datasets**: Always use pagination with `limit` to avoid loading too much data
2. **Default Limits**: Default page size is 10, but can be increased up to 100 per request
3. **Iteration**: Use `has_next` flag to determine if more pages exist
4. **Performance**: Limit results and use filtering to improve query performance

## Sorting Best Practices

1. **Single Field Sort**: `sort=registrationNumber` (ascending by default)
2. **Descending Order**: `sort=-registrationNumber` (prefix with `-` for descending)
3. **Multiple Fields**: `sort=province,-createdAt,ownerName` (sorts by province ascending, then createdAt descending, then ownerName ascending)
4. **Valid Fields Only**: Only fields listed above are sortable

## Filtering Best Practices

1. **Exact Match**: Use exact values for `province` and `district`
2. **Search**: Use `registrationNumber` and `ownerName` for partial/case-insensitive search
3. **Combine Filters**: Multiple filters work together (AND logic)
4. **Date Ranges**: Use both `startDate` and `endDate` for better results

## Error Handling

### Invalid Page Number
```json
{
  "error": "Invalid query parameters",
  "message": "Error fetching tuk-tuks"
}
```

### No Results Found
```json
{
  "message": "No tuk-tuks found in this province",
  "data": [],
  "pagination": {...}
}
```

### Validation Errors
```json
{
  "message": "Error message",
  "error": "Details about what went wrong"
}
```

## Query Builder Utility Functions

The `utils/queryBuilder.js` file provides reusable functions:

- **`buildFilter(queryParams, allowedFields)`**: Creates MongoDB filter object
- **`buildSort(sortParam, allowedFields)`**: Creates MongoDB sort object
- **`getPagination(queryParams)`**: Extracts pagination parameters
- **`executeQuery(model, queryParams, options)`**: Executes complete query with all features
- **`formatQueryResponse(queryResult)`**: Formats response with pagination metadata

### Using in New Routes

```javascript
const { executeQuery, formatQueryResponse } = require('../utils/queryBuilder');

router.get('/custom', async (req, res) => {
  const result = await executeQuery(MyModel, req.query, {
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

## Testing the Advanced Features

### Using Postman

1. Create a request to: `GET /api/tuk-tuks`
2. Add query parameters in the "Params" tab:
   - `page`: 1
   - `limit`: 10
   - `sort`: registrationNumber
   - `province`: Bangkok
3. Add Authorization header with JWT token
4. Send the request

### Using cURL

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?province=Bangkok&page=1&limit=10&sort=registrationNumber" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Performance Tips

1. **Use Pagination**: Always paginate large result sets
2. **Add Indexes**: Ensure database indexes on frequently filtered/sorted fields
3. **Limit Page Size**: Don't request more than 50-100 records per page
4. **Filter Early**: Apply filters to reduce dataset before sorting
5. **Cache Results**: Consider caching frequently accessed pages

---

For more information, see the API documentation or contact the development team.
