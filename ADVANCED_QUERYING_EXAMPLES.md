# Advanced Querying - Usage Examples

This file contains practical examples for using the advanced querying features.

## Prerequisites

- Postman or cURL installed
- Valid JWT token for authentication
- API running on `http://localhost:5000`

## Basic Examples

### 1. Get All TukTuks with Default Pagination

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Get TukTuks with Custom Page Size

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Navigate to Page 2 with 20 Items Per Page

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?page=2&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Filtering Examples

### 4. Filter by Province (Bangkok)

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?province=Bangkok" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 5. Filter by District (Sukhumvit)

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?district=Sukhumvit" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 6. Filter by Province AND District (Bangkok + Sukhumvit)

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?province=Bangkok&district=Sukhumvit" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 7. Search for Registration Number (Case-Insensitive)

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?registrationNumber=abc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 8. Search for Owner Name (Case-Insensitive)

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?ownerName=john" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Sorting Examples

### 9. Sort by Registration Number (Ascending)

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?sort=registrationNumber" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 10. Sort by Registration Number (Descending)

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?sort=-registrationNumber" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 11. Sort by Owner Name (Ascending)

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?sort=ownerName" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 12. Sort by District (Descending)

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?sort=-district" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 13. Sort by Multiple Fields (Province + Registration Number Desc)

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?sort=province,-registrationNumber" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Combined Examples

### 14. Filter by Province + Sort by Owner Name + Paginate

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?province=Bangkok&sort=ownerName&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

Response example:
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "registrationNumber": "BKK-1001",
      "ownerName": "Alice Brown",
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
    "total": 45,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  },
  "filters": {
    "province": "Bangkok"
  },
  "sort": {
    "ownerName": 1
  }
}
```

### 15. Complex Query - Province + District + Sort + Pagination

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?province=Bangkok&district=Sukhumvit&sort=-registrationNumber&page=2&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 16. Using Province Filter Route with Advanced Options

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks/filter/province/Bangkok?sort=ownerName&limit=25&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 17. Using District Filter Route with Advanced Options

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks/filter/district/Sukhumvit?sort=-registrationNumber&limit=15&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Movement History Examples

### 18. Get Movement History with Date Range

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks/{id}/movement-history?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

Replace `{id}` with actual TukTuk ID (e.g., `507f1f77bcf86cd799439011`)

### 19. Get Movement History with Pagination

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks/{id}/movement-history?page=1&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 20. Get Movement History Sorted by Timestamp (Most Recent First)

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks/{id}/movement-history?sort=-timestamp&page=1&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 21. Get Movement History with All Options Combined

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks/{id}/movement-history?startDate=2024-01-01&endDate=2024-01-31&sort=-timestamp&page=1&limit=100" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Real-World Scenarios

### Scenario 1: Get Top 10 Most Recently Added TukTuks in Bangkok

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?province=Bangkok&sort=-createdAt&limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Scenario 2: Search for TukTuk Owner and View Results Paginated

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?ownerName=john&sort=registrationNumber&limit=20&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Scenario 3: Get All TukTuks from a District Sorted Alphabetically by Owner

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks/filter/district/Sukhumvit?sort=ownerName&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Scenario 4: Get Latest Movement History for Specific TukTuk (Last 24 Hours, 50 records)

```bash
# First, get today's date and yesterday's date
# Then use them in the query

curl -X GET "http://localhost:5000/api/tuk-tuks/{id}/movement-history?startDate=2024-01-14T00:00:00Z&endDate=2024-01-15T23:59:59Z&sort=-timestamp&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Scenario 5: List All TukTuks with Custom Sort and Pagination for Dashboard

```bash
curl -X GET "http://localhost:5000/api/tuk-tuks?sort=-registrationNumber&limit=100&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Using Postman

### Step-by-Step Guide:

1. **Create a new GET request** in Postman
2. **Enter URL**: `http://localhost:5000/api/tuk-tuks`
3. **Go to "Params" tab** and add:
   - Key: `province`, Value: `Bangkok`
   - Key: `sort`, Value: `ownerName`
   - Key: `limit`, Value: `20`
   - Key: `page`, Value: `1`
4. **Go to "Headers" tab** and add:
   - Key: `Authorization`, Value: `Bearer YOUR_JWT_TOKEN`
5. **Click "Send"**

## Response Examples

### Success Response with Results

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "registrationNumber": "BKK-1001",
      "ownerName": "Alice Brown",
      "province": "Bangkok",
      "district": "Sukhumvit",
      "lastKnownLocation": {
        "latitude": 13.7563,
        "longitude": 100.5018,
        "timestamp": "2024-01-15T10:30:00Z"
      }
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "registrationNumber": "BKK-1002",
      "ownerName": "John Doe",
      "province": "Bangkok",
      "district": "Sukhumvit",
      "lastKnownLocation": {
        "latitude": 13.7545,
        "longitude": 100.5020,
        "timestamp": "2024-01-15T09:45:00Z"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 45,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  },
  "filters": {
    "province": "Bangkok"
  },
  "sort": {
    "ownerName": 1
  }
}
```

### Success Response with No Results

```json
{
  "message": "No tuk-tuks found in this province",
  "data": [],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 0,
    "total_pages": 0,
    "has_next": false,
    "has_prev": false
  }
}
```

### Error Response

```json
{
  "error": "Invalid query parameters",
  "message": "Error fetching tuk-tuks"
}
```

## Testing Tips

1. **Always include Authorization header** with valid JWT token
2. **Use limit=10 initially** to ensure pagination works
3. **Test with different page numbers** to verify navigation
4. **Combine filters gradually** to understand query behavior
5. **Check total_pages** to know how many pages exist
6. **Use has_next flag** to determine if more data is available

## Performance Considerations

- Default page size is 10, max is 100
- Larger page sizes may impact performance
- Use filters to reduce data before sorting
- Most frequent queries should be indexed in MongoDB
- Consider caching for frequently accessed queries
