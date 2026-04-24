# 🔧 cURL Commands for Testing API

Your server is running on **http://localhost:5000**

All commands below are ready to copy-paste into PowerShell or Terminal.

---

## 📋 Table of Contents
1. [Authentication (Register/Login)](#authentication)
2. [User Profile](#user-profile)
3. [Tuk-Tuk Management](#tuk-tuk-management)
4. [Real-Time Tracking](#real-time-tracking)
5. [Filtering](#filtering)

---

## 🔐 Authentication

### 1️⃣ Register Police Officer
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d {^
    \"username\": \"officer_001\",^
    \"email\": \"officer@police.lk\",^
    \"password\": \"TestPass@123\",^
    \"province\": \"Western\",^
    \"district\": \"Colombo\",^
    \"role\": \"police_officer\"^
  }
```

### 2️⃣ Register Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d {^
    \"username\": \"admin_user\",^
    \"email\": \"admin@police.lk\",^
    \"password\": \"AdminPass@123\",^
    \"province\": \"Western\",^
    \"district\": \"Colombo\",^
    \"role\": \"admin\"^
  }
```

### 3️⃣ Login User (Get JWT Token)
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d {^
    \"email\": \"officer@police.lk\",^
    \"password\": \"TestPass@123\"^
  }
```

**Response will include token:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "officer_001",
    "role": "police_officer"
  }
}
```

**Copy the token value and use in following requests** ⬅️

### 4️⃣ Login Admin (Get Admin Token)
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d {^
    \"email\": \"admin@police.lk\",^
    \"password\": \"AdminPass@123\"^
  }
```

---

## 👤 User Profile

### 5️⃣ Get Your Profile
Replace `YOUR_TOKEN` with the token from login response:

```bash
curl -X GET http://localhost:5000/api/auth/profile ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Example with actual token:**
```bash
curl -X GET http://localhost:5000/api/auth/profile ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🚗 Tuk-Tuk Management

### 6️⃣ Register Tuk-Tuk (Admin Only)
Use admin token from step 4:

```bash
curl -X POST http://localhost:5000/api/tuk-tuks/register ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" ^
  -d {^
    \"registrationNumber\": \"WB-ABC-1234\",^
    \"ownerName\": \"Colombo Tuk Owner\",^
    \"province\": \"Western\",^
    \"district\": \"Colombo\",^
    \"lastKnownLocation\": {^
      \"latitude\": 6.9271,^
      \"longitude\": 80.7789^
    }^
  }
```

### 7️⃣ Register Second Tuk-Tuk (Different Location)
```bash
curl -X POST http://localhost:5000/api/tuk-tuks/register ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" ^
  -d {^
    \"registrationNumber\": \"CP-XYZ-5678\",^
    \"ownerName\": \"Kandy Tuk Owner\",^
    \"province\": \"Central\",^
    \"district\": \"Kandy\",^
    \"lastKnownLocation\": {^
      \"latitude\": 7.2906,^
      \"longitude\": 80.6337^
    }^
  }
```

### 8️⃣ Get All Tuk-Tuks
```bash
curl -X GET http://localhost:5000/api/tuk-tuks ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 9️⃣ Get Specific Tuk-Tuk by ID
Replace `TUK_TUK_ID` with the ID from response of step 6:

```bash
curl -X GET http://localhost:5000/api/tuk-tuks/TUK_TUK_ID ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📍 Real-Time Tracking

### 🔟 Update Tuk-Tuk Location
Replace `TUK_TUK_ID` and `YOUR_TOKEN`:

```bash
curl -X PUT http://localhost:5000/api/tuk-tuks/TUK_TUK_ID/update-location ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -d {^
    \"latitude\": 6.9280,^
    \"longitude\": 80.7800,^
    \"speed\": 50,^
    \"accuracy\": 5^
  }
```

### 1️⃣1️⃣ Update Location Multiple Times (Simulate Movement)
Execute this 3-4 times with different coordinates:

```bash
curl -X PUT http://localhost:5000/api/tuk-tuks/TUK_TUK_ID/update-location ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -d {^
    \"latitude\": 6.9300,^
    \"longitude\": 80.7850,^
    \"speed\": 55,^
    \"accuracy\": 5^
  }
```

Then:
```bash
curl -X PUT http://localhost:5000/api/tuk-tuks/TUK_TUK_ID/update-location ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -d {^
    \"latitude\": 6.9350,^
    \"longitude\": 80.7900,^
    \"speed\": 60,^
    \"accuracy\": 5^
  }
```

### 1️⃣2️⃣ Get Movement History (Time-Based Query)
```bash
curl -X GET "http://localhost:5000/api/tuk-tuks/TUK_TUK_ID/movement-history?startDate=2026-04-20&endDate=2026-04-25" ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔍 Filtering

### 1️⃣3️⃣ Filter Tuk-Tuks by Province
```bash
curl -X GET http://localhost:5000/api/tuk-tuks/filter/province/Western ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

Other provinces:
```bash
curl -X GET http://localhost:5000/api/tuk-tuks/filter/province/Central ^
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X GET http://localhost:5000/api/tuk-tuks/filter/province/Southern ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 1️⃣4️⃣ Filter Tuk-Tuks by District
```bash
curl -X GET http://localhost:5000/api/tuk-tuks/filter/district/Colombo ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

Other districts:
```bash
curl -X GET http://localhost:5000/api/tuk-tuks/filter/district/Kandy ^
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X GET http://localhost:5000/api/tuk-tuks/filter/district/Matara ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧪 Error Testing

### 1️⃣5️⃣ Test: Login with Wrong Password
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d {^
    \"email\": \"officer@police.lk\",^
    \"password\": \"WrongPassword\"^
  }
```
**Expected**: 401 Unauthorized

### 1️⃣6️⃣ Test: Access Protected Endpoint Without Token
```bash
curl -X GET http://localhost:5000/api/auth/profile
```
**Expected**: 401 No token provided

### 1️⃣7️⃣ Test: Admin Operation as Non-Admin
```bash
curl -X POST http://localhost:5000/api/tuk-tuks/register ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_OFFICER_TOKEN" ^
  -d {^
    \"registrationNumber\": \"TEST-001\",^
    \"ownerName\": \"Test\",^
    \"province\": \"Western\",^
    \"district\": \"Colombo\"^
  }
```
**Expected**: 403 Access denied

### 1️⃣8️⃣ Test: Update Non-Existent Vehicle
```bash
curl -X PUT http://localhost:5000/api/tuk-tuks/000000000000000000000000/update-location ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -d {^
    \"latitude\": 6.9271,^
    \"longitude\": 80.7789^
  }
```
**Expected**: 404 Tuk-tuk not found

---

## 📊 Complete Test Sequence (Copy-Paste in Order)

### Step 1: Register Officer
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d {^
    \"username\": \"officer_001\",^
    \"email\": \"officer@police.lk\",^
    \"password\": \"TestPass@123\",^
    \"province\": \"Western\",^
    \"district\": \"Colombo\",^
    \"role\": \"police_officer\"^
  }
```

### Step 2: Register Admin
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d {^
    \"username\": \"admin_user\",^
    \"email\": \"admin@police.lk\",^
    \"password\": \"AdminPass@123\",^
    \"province\": \"Western\",^
    \"district\": \"Colombo\",^
    \"role\": \"admin\"^
  }
```

### Step 3: Login Officer
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d {^
    \"email\": \"officer@police.lk\",^
    \"password\": \"TestPass@123\"^
  }
```
👉 **Copy officer token from response**

### Step 4: Login Admin
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d {^
    \"email\": \"admin@police.lk\",^
    \"password\": \"AdminPass@123\"^
  }
```
👉 **Copy admin token from response**

### Step 5: Register Vehicle (Use Admin Token)
```bash
curl -X POST http://localhost:5000/api/tuk-tuks/register ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" ^
  -d {^
    \"registrationNumber\": \"WB-ABC-1234\",^
    \"ownerName\": \"Colombo Tuk Owner\",^
    \"province\": \"Western\",^
    \"district\": \"Colombo\",^
    \"lastKnownLocation\": {^
      \"latitude\": 6.9271,^
      \"longitude\": 80.7789^
    }^
  }
```
👉 **Copy vehicle ID from response**

### Step 6: Update Vehicle Location
```bash
curl -X PUT http://localhost:5000/api/tuk-tuks/YOUR_VEHICLE_ID/update-location ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_OFFICER_TOKEN" ^
  -d {^
    \"latitude\": 6.9300,^
    \"longitude\": 80.7850,^
    \"speed\": 50,^
    \"accuracy\": 5^
  }
```

### Step 7: Get All Vehicles
```bash
curl -X GET http://localhost:5000/api/tuk-tuks ^
  -H "Authorization: Bearer YOUR_OFFICER_TOKEN"
```

### Step 8: Filter by Province
```bash
curl -X GET http://localhost:5000/api/tuk-tuks/filter/province/Western ^
  -H "Authorization: Bearer YOUR_OFFICER_TOKEN"
```

✅ **All tests complete!**

---

## 💡 Tips for PowerShell Users

### Issue: Line breaks with `^`
The `^` character continues a line in PowerShell. Works natively.

### Alternative: Use JSON File
Save as `payload.json`:
```json
{
  "email": "officer@police.lk",
  "password": "TestPass@123"
}
```

Then use:
```bash
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d @payload.json
```

### View Response Beautifully
Install `jq` or pipe to format-table:

PowerShell:
```bash
curl -X GET http://localhost:5000/api/auth/profile ^
  -H "Authorization: Bearer YOUR_TOKEN" | ConvertFrom-Json | Format-Table
```

---

## 🎯 Quick Reference

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Register | POST | /api/auth/register |
| Login | POST | /api/auth/login |
| Get Profile | GET | /api/auth/profile |
| Register Vehicle | POST | /api/tuk-tuks/register |
| List Vehicles | GET | /api/tuk-tuks |
| Get Vehicle | GET | /api/tuk-tuks/:id |
| Update Location | PUT | /api/tuk-tuks/:id/update-location |
| Movement History | GET | /api/tuk-tuks/:id/movement-history |
| Filter Province | GET | /api/tuk-tuks/filter/province/:province |
| Filter District | GET | /api/tuk-tuks/filter/district/:district |

---

## 📌 Remember

- **Replace placeholders**: YOUR_TOKEN, TUK_TUK_ID, etc.
- **Admin operations**: Always use admin token for vehicle registration
- **Authorization header**: Always include for protected endpoints
- **Content-Type**: Always set to `application/json` for POST/PUT requests

**Ready to test! Copy commands and execute them.** 🚀
