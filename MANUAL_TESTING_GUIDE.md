# 📱 Manual Testing Guide - Postman + MongoDB Atlas

## ✅ Server Status
- **Server**: Running on `http://localhost:5000` ✅
- **Database**: Connected to MongoDB Atlas ✅
- **Ready for**: Manual API testing with Postman ✅

---

## 🔧 Step 1: Import Postman Collection

1. **Open Postman** (Download from [postman.com](https://www.postman.com/downloads/))
2. **Click**: `File` → `Import`
3. **Select**: `Postman_Collection.json` from your project
4. **Collection loaded** with all endpoints ready to test

---

## 📋 Manual Testing Workflow

### Step 1: Register New User
**Endpoint**: `POST http://localhost:5000/api/auth/register`

**Request Body**:
```json
{
  "username": "officer_001",
  "email": "officer@police.lk",
  "password": "SecurePass@123",
  "province": "Western",
  "district": "Colombo",
  "role": "police_officer"
}
```

**Expected Response** (201):
```json
{
  "message": "User registered successfully",
  "userId": "507f1f77bcf86cd799439011"
}
```

---

### Step 2: Login User & Get JWT Token
**Endpoint**: `POST http://localhost:5000/api/auth/login`

**Request Body**:
```json
{
  "email": "officer@police.lk",
  "password": "SecurePass@123"
}
```

**Expected Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJ1c2VybmFtZSI6Im9mZmljZXJfMDAxIiwicm9sZSI6InBvbGljZV9vZmZpY2VyIiwicHJvdmluY2UiOiJXZXN0ZXJuIiwiZGlzdHJpY3QiOiJDb2xvbWJvIn0.xxx",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "officer_001",
    "role": "police_officer"
  }
}
```

**Save the Token**: Copy the `token` value to use in following requests

---

### Step 3: Test Authenticated Endpoint (Get Profile)
**Endpoint**: `GET http://localhost:5000/api/auth/profile`

**Headers**:
```
Authorization: Bearer {YOUR_JWT_TOKEN}
```

**Expected Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "officer_001",
  "email": "officer@police.lk",
  "role": "police_officer",
  "province": "Western",
  "district": "Colombo",
  "createdAt": "2026-04-24T06:30:00.000Z"
}
```

---

### Step 4: Register Admin User (For Vehicle Registration)
**Endpoint**: `POST http://localhost:5000/api/auth/register`

**Request Body**:
```json
{
  "username": "admin_user",
  "email": "admin@police.lk",
  "password": "AdminPass@123",
  "province": "Western",
  "district": "Colombo",
  "role": "admin"
}
```

**Login as admin** and copy the admin JWT token

---

### Step 5: Register Tuk-Tuk (Admin Only)
**Endpoint**: `POST http://localhost:5000/api/tuk-tuks/register`

**Headers**:
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
Content-Type: application/json
```

**Request Body**:
```json
{
  "registrationNumber": "WB-ABC-1234",
  "ownerName": "Colombo Tuk Owner",
  "province": "Western",
  "district": "Colombo",
  "lastKnownLocation": {
    "latitude": 6.9271,
    "longitude": 80.7789
  }
}
```

**Expected Response** (201):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "registrationNumber": "WB-ABC-1234",
  "ownerName": "Colombo Tuk Owner",
  "province": "Western",
  "district": "Colombo",
  "lastKnownLocation": {
    "latitude": 6.9271,
    "longitude": 80.7789,
    "timestamp": "2026-04-24T06:35:00.000Z"
  }
}
```

**Save the Tuk-Tuk ID**: You'll need it for location updates

---

### Step 6: Get All Tuk-Tuks
**Endpoint**: `GET http://localhost:5000/api/tuk-tuks`

**Headers**:
```
Authorization: Bearer {ANY_JWT_TOKEN}
```

**Expected Response** (200): Array of all tuk-tuks

---

### Step 7: Get Tuk-Tuk by ID
**Endpoint**: `GET http://localhost:5000/api/tuk-tuks/{TUK_TUK_ID}`

Replace `{TUK_TUK_ID}` with the ID from Step 5

**Headers**:
```
Authorization: Bearer {ANY_JWT_TOKEN}
```

**Expected Response** (200): Single tuk-tuk details

---

### Step 8: Filter Tuk-Tuks by Province
**Endpoint**: `GET http://localhost:5000/api/tuk-tuks/filter/province/Western`

**Headers**:
```
Authorization: Bearer {ANY_JWT_TOKEN}
```

**Expected Response** (200): All tuk-tuks in Western province

---

### Step 9: Filter Tuk-Tuks by District
**Endpoint**: `GET http://localhost:5000/api/tuk-tuks/filter/district/Colombo`

**Headers**:
```
Authorization: Bearer {ANY_JWT_TOKEN}
```

**Expected Response** (200): All tuk-tuks in Colombo district

---

### Step 10: Update Tuk-Tuk Location (Real-Time Tracking)
**Endpoint**: `PUT http://localhost:5000/api/tuk-tuks/{TUK_TUK_ID}/update-location`

**Headers**:
```
Authorization: Bearer {ANY_JWT_TOKEN}
Content-Type: application/json
```

**Request Body**:
```json
{
  "latitude": 6.9275,
  "longitude": 80.7795,
  "speed": 45,
  "accuracy": 5
}
```

**Expected Response** (200):
```json
{
  "message": "Location updated successfully",
  "tukTuk": {
    "_id": "507f1f77bcf86cd799439012",
    "registrationNumber": "WB-ABC-1234",
    "lastKnownLocation": {
      "latitude": 6.9275,
      "longitude": 80.7795,
      "timestamp": "2026-04-24T06:40:00.000Z"
    }
  }
}
```

---

### Step 11: Get Movement History (Time-Based)
**Endpoint**: `GET http://localhost:5000/api/tuk-tuks/{TUK_TUK_ID}/movement-history?startDate=2026-04-20&endDate=2026-04-25`

**Headers**:
```
Authorization: Bearer {ANY_JWT_TOKEN}
```

**Query Parameters**:
- `startDate`: 2026-04-20 (ISO format)
- `endDate`: 2026-04-25 (ISO format)

**Expected Response** (200): Array of location history records

---

## 📍 Test Data Reference

### Sri Lankan Provinces & Coordinates

| Province | District | Latitude | Longitude |
|----------|----------|----------|-----------|
| Western | Colombo | 6.9271 | 80.7789 |
| Western | Galle | 6.0535 | 80.2179 |
| Central | Kandy | 7.2906 | 80.6337 |
| Southern | Matara | 5.7489 | 80.7853 |
| Southern | Galle | 6.0535 | 80.2179 |

---

## 🚨 Common Error Responses

### 400 - Bad Request (Missing Fields)
```json
{
  "message": "All fields are required"
}
```
**Fix**: Ensure all required fields are provided

### 401 - Unauthorized (No Token)
```json
{
  "message": "No token provided"
}
```
**Fix**: Add `Authorization: Bearer {TOKEN}` header

### 401 - Invalid Token
```json
{
  "message": "Invalid or expired token"
}
```
**Fix**: Provide a valid JWT token from login

### 403 - Forbidden (Not Admin)
```json
{
  "message": "Access denied"
}
```
**Fix**: Use admin account to register tuk-tuks

### 404 - Not Found
```json
{
  "message": "Tuk-tuk not found"
}
```
**Fix**: Verify the ID is correct

---

## 🎯 Complete Manual Test Workflow

```
1. Register Police Officer
   ↓
2. Login & Get Token
   ↓
3. View Profile
   ↓
4. Register Admin
   ↓
5. Login as Admin
   ↓
6. Register Tuk-Tuk #1 (Colombo)
   ↓
7. Register Tuk-Tuk #2 (Kandy)
   ↓
8. Get All Tuk-Tuks
   ↓
9. Filter by Province (Western)
   ↓
10. Filter by District (Colombo)
   ↓
11. Update Location (Real-time)
   ↓
12. View Movement History
   ↓
✅ All Features Tested!
```

---

## 💾 Postman Environment Setup

### Create Postman Variables for Easy Testing

1. **Open Postman**
2. **Settings** → **Environments** → **Create New**
3. **Add Variables**:

| Variable | Value | Example |
|----------|-------|---------|
| `base_url` | http://localhost:5000 | http://localhost:5000 |
| `jwt_token` | (Leave blank, fill after login) | eyJ... |
| `tuk_tuk_id` | (Leave blank, fill after creation) | 507f1f77... |
| `admin_token` | (Leave blank, fill after admin login) | eyJ... |

4. **Use in Requests**:
   ```
   {{base_url}}/api/auth/profile
   Authorization: Bearer {{jwt_token}}
   ```

---

## ✅ Testing Checklist

- [ ] Server running on port 5000
- [ ] Connected to MongoDB Atlas
- [ ] Registered police officer user
- [ ] Logged in and received JWT token
- [ ] Retrieved user profile
- [ ] Registered admin user
- [ ] Registered tuk-tuk as admin
- [ ] Listed all tuk-tuks
- [ ] Filtered by province
- [ ] Filtered by district
- [ ] Updated tuk-tuk location
- [ ] Retrieved movement history
- [ ] All 12 manual tests passed ✅

---

## 🔍 Debugging Tips

### Check Server Logs
Terminal shows all requests and errors in real-time

### Verify MongoDB Connection
- Check Atlas connection string in `.env`
- Ensure IP whitelist includes your machine

### Token Issues
- Copy token immediately after login
- Token expires in 7 days (default)
- If expired, login again to get new token

### Location Update Issues
- Ensure latitude: -90 to 90
- Ensure longitude: -180 to 180
- Valid Sri Lanka coords: 5.7°N to 7.3°N, 80.0°E to 81.9°E

---

## 📞 If Something Doesn't Work

1. **Check Server Terminal** - Look for error messages
2. **Verify `.env`** - MONGO_URI and JWT_SECRET configured
3. **Restart Server** - Stop and run `npm run dev` again
4. **Check MongoDB Atlas** - Ensure database is accessible
5. **Verify Postman Headers** - Ensure Authorization header is present

---

**Ready to test! Open Postman and follow the workflow above.** 🚀
