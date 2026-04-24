# Testing Documentation - Tuk-Tuk Tracking API

## 📋 Overview

This document provides comprehensive testing information for the **Real-Time Tuk-Tuk Tracking & Movement Logging System** API.

### Test Results Summary
- **Total Tests**: 31
- **Passed**: 31 ✅
- **Failed**: 0
- **Coverage**: Routes, Models, Middleware

---

## 🧪 Test Suites

### 1. **Authentication Tests** (`tests/auth.test.js`)
Tests the user authentication and authorization system.

#### Test Cases:
- ✅ **User Registration** (4 tests)
  - Register new user successfully
  - Reject registration with missing required fields
  - Prevent duplicate email registration
  - Prevent duplicate username registration
  - Set default role to `police_officer`

- ✅ **User Login** (5 tests)
  - Login with correct credentials
  - Reject login with invalid credentials
  - Reject login if user doesn't exist
  - Reject login with missing credentials
  - Verify JWT token contains role, province, district

- ✅ **User Profile** (3 tests)
  - Get authenticated user profile
  - Return 401 without token
  - Return 401 with invalid token
  - Verify password field is excluded from response

**Total Auth Tests**: 12

---

### 2. **Tuk-Tuk Routes Tests** (`tests/tukTuk.test.js`)
Tests vehicle registration, tracking, and filtering features.

#### Test Cases:
- ✅ **Tuk-Tuk Registration** (3 tests)
  - Register new tuk-tuk as admin
  - Reject registration by non-admin users (403)
  - Reject registration with missing required fields

- ✅ **Get All Tuk-Tuks** (2 tests)
  - Retrieve all tuk-tuks (authenticated user)
  - Return 401 without authentication

- ✅ **Get Tuk-Tuk by ID** (2 tests)
  - Retrieve specific tuk-tuk by ID
  - Return 404 for non-existent tuk-tuk

- ✅ **Filter by Province** (2 tests)
  - Filter tuk-tuks by province
  - Return 404 if no tuk-tuks found in province

- ✅ **Filter by District** (2 tests)
  - Filter tuk-tuks by district
  - Return 404 if no tuk-tuks found in district

- ✅ **Real-Time Location Tracking** (5 tests)
  - Update tuk-tuk location successfully
  - Create location history entry on update
  - Reject update with missing coordinates
  - Return 404 for non-existent tuk-tuk
  - Record speed and accuracy in location history

**Total Tuk-Tuk Tests**: 19

---

## 🚀 Running Tests

### Prerequisites
- Node.js (v14+)
- MongoDB (local or remote connection)
- Dependencies installed: `npm install`

### Environment Setup
Ensure `.env` file contains:
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=app
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_in_production
```

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests with extended timeout
npm test -- --testTimeout=30000
```

---

## 📊 Test Coverage

### Routes Coverage
- **authRoutes.js**: 12 tests covering all endpoints
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/auth/profile

- **tukTukRoutes.js**: 19 tests covering all endpoints
  - POST /api/tuk-tuks/register (Admin only)
  - GET /api/tuk-tuks (List all)
  - GET /api/tuk-tuks/:id (Get by ID)
  - GET /api/tuk-tuks/filter/province/:province
  - GET /api/tuk-tuks/filter/district/:district
  - PUT /api/tuk-tuks/:id/update-location (Real-time tracking)

### Middleware Coverage
- **authMiddleware**: Authentication token validation
- **authorize**: Role-based access control

### Models Coverage
- **User Model**: Password hashing and comparison
- **TukTuk Model**: Vehicle data persistence
- **LocationHistory Model**: Location tracking records

---

## 🔐 Security Tests

The test suite validates:
- ✅ JWT token validation and expiration
- ✅ Role-based access control (admin, police_officer, operator)
- ✅ Password encryption and comparison
- ✅ Protected endpoints require authentication
- ✅ Admin-only operations are restricted
- ✅ Password field is excluded from responses

---

## 📍 Feature Tests

### Authentication
- User registration with validation
- Password hashing with bcryptjs
- JWT token generation with user metadata
- Token-based authentication
- Role-based authorization

### Tuk-Tuk Management
- Vehicle registration (admin only)
- Vehicle listing and retrieval
- Province-based filtering
- District-based filtering
- Real-time location updates

### Movement Logging
- Location history creation
- Speed and accuracy recording
- Timestamp tracking for time-based queries

---

## 🐛 Debugging Tests

### Enable Debug Logging
```bash
DEBUG=* npm test
```

### Run Specific Test File
```bash
npm test -- auth.test.js
```

### Run Specific Test Suite
```bash
npm test -- --testNamePattern="POST /api/auth/login"
```

---

## 📝 Test Data

### Test Users
- **Admin**: admin@police.lk / AdminPass123!
- **Officer**: officer@police.lk / OfficerPass123!

### Test Tuk-Tuks
- Registration Numbers: CAB-001, CAB-002, CAB-003
- Provinces: Western, Central, Southern
- Districts: Colombo, Kandy, Matara, Galle

### GPS Coordinates (Sri Lanka)
- Colombo: 6.9271°N, 80.7789°E
- Kandy: 7.2906°N, 80.6337°E
- Matara: 5.7489°N, 80.7853°E
- Galle: 6.0535°N, 80.2179°E

---

## 🔄 CI/CD Integration

For GitHub Actions or other CI/CD pipelines:

```yaml
- name: Run Tests
  run: npm test -- --forceExit --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

---

## 📚 API Response Examples

### Successful Login
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "officer",
    "role": "police_officer"
  }
}
```

### Tuk-Tuk Location Update
```json
{
  "message": "Location updated successfully",
  "tukTuk": {
    "_id": "507f1f77bcf86cd799439012",
    "registrationNumber": "CAB-001",
    "lastKnownLocation": {
      "latitude": 7.0,
      "longitude": 80.8,
      "timestamp": "2026-04-24T06:10:45.091Z"
    }
  }
}
```

---

## ⚠️ Common Issues & Solutions

### Issue: "MONGODB DRIVER" Warnings
**Solution**: These are deprecated option warnings. Safe to ignore in tests.

### Issue: Tests timeout after 30s
**Solution**: Increase timeout with `--testTimeout=60000`

### Issue: Connection refused error
**Solution**: Ensure MongoDB is running or connection string is correct in `.env`

### Issue: JWT verification fails
**Solution**: Verify `JWT_SECRET` is set in `.env` file

---

## 🎯 Testing Best Practices Used

1. **Test Isolation**: Each test is independent with clean database state
2. **Proper Cleanup**: `afterEach()` removes test data
3. **Authentication Mocking**: Tokens generated for each test
4. **Comprehensive Assertions**: Multiple checks per test
5. **Error Case Coverage**: Both success and failure paths tested
6. **Real Database**: Uses MongoDB for integration testing

---

## 📞 Support

For issues or questions about testing:
1. Check test output for specific error messages
2. Review individual test cases in `tests/` directory
3. Verify `.env` configuration
4. Ensure MongoDB connection is active

---

**Last Updated**: April 24, 2026  
**Test Framework**: Jest + Supertest  
**Total Coverage**: 31 tests, 2 test suites
