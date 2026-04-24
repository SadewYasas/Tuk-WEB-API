# 🚀 Quick Start Manual Testing

## Your Server is Running! ✅

```
Server: http://localhost:5000
Database: MongoDB Atlas Connected
Status: Ready for testing
```

---

## 📥 Import Postman Collection

1. **Download Postman**: https://www.postman.com/downloads/
2. **Open Postman** 
3. **Click File → Import**
4. **Select**: `Postman_Collection.json` from your project folder
5. **Collection loaded!** ✅

---

## 🔑 Quick Test (Copy-Paste Ready)

### 1️⃣ Register User
```
POST http://localhost:5000/api/auth/register

{
  "username": "testuser",
  "email": "test@police.lk",
  "password": "Test@123",
  "province": "Western",
  "district": "Colombo",
  "role": "police_officer"
}
```

### 2️⃣ Login
```
POST http://localhost:5000/api/auth/login

{
  "email": "test@police.lk", 
  "password": "Test@123"
}
```
**Copy the token from response** ⬅️

### 3️⃣ Get Profile (Use your token)
```
GET http://localhost:5000/api/auth/profile

Header: Authorization: Bearer {YOUR_TOKEN}
```

---

## 📍 Quick Vehicle Testing

### 4️⃣ Register Admin
```
POST http://localhost:5000/api/auth/register

{
  "username": "admin",
  "email": "admin@police.lk", 
  "password": "Admin@123",
  "province": "Western",
  "district": "Colombo",
  "role": "admin"
}
```
**Login as admin, copy admin token**

### 5️⃣ Register Tuk-Tuk (Use admin token)
```
POST http://localhost:5000/api/tuk-tuks/register

Header: Authorization: Bearer {ADMIN_TOKEN}

{
  "registrationNumber": "CAB-001",
  "ownerName": "Owner Name",
  "province": "Western",
  "district": "Colombo",
  "lastKnownLocation": {
    "latitude": 6.9271,
    "longitude": 80.7789
  }
}
```
**Copy the tuk-tuk ID from response** ⬅️

### 6️⃣ Update Location (Real-Time Tracking)
```
PUT http://localhost:5000/api/tuk-tuks/{TUK_TUK_ID}/update-location

Header: Authorization: Bearer {YOUR_TOKEN}

{
  "latitude": 6.9280,
  "longitude": 80.7800,
  "speed": 50,
  "accuracy": 5
}
```

### 7️⃣ Get All Tuk-Tuks
```
GET http://localhost:5000/api/tuk-tuks

Header: Authorization: Bearer {YOUR_TOKEN}
```

### 8️⃣ Filter by Province
```
GET http://localhost:5000/api/tuk-tuks/filter/province/Western

Header: Authorization: Bearer {YOUR_TOKEN}
```

---

## 📊 What to Test

✅ User Registration - Create different roles (admin, police_officer)
✅ User Login - Get JWT tokens
✅ User Profile - View logged-in user info
✅ Tuk-Tuk Registration - Only admin can register
✅ List Vehicles - Get all tuk-tuks
✅ Filter by Province - Test Western, Central, Southern
✅ Filter by District - Test different districts
✅ Real-Time Location Updates - Update coordinates and speed
✅ Movement History - View location tracking over time

---

## 🛠️ Postman Tips

### Save Variables
After login, set Postman variables:
- Right-click collection → Edit → Variables
- Add `jwt_token` variable and set value from login response
- Add `tuk_tuk_id` variable after vehicle creation
- Now use `{{jwt_token}}` and `{{tuk_tuk_id}}` in requests

### Test Different Users
- Police Officer can view, but not register tuk-tuks
- Admin can register and manage tuk-tuks
- Try using officer token on admin-only endpoints (should get 403 error)

### Test Error Cases
- Try login with wrong password (401 error)
- Try accessing without token (401 error)  
- Try admin operation as officer (403 error)
- Try updating non-existent vehicle (404 error)

---

## 📁 Sri Lanka Coordinates

**Western Province**
- Colombo: 6.9271°N, 80.7789°E
- Galle: 6.0535°N, 80.2179°E

**Central Province**
- Kandy: 7.2906°N, 80.6337°E

**Southern Province**
- Matara: 5.7489°N, 80.7853°E

---

## 🎯 Test Sequence

```
1. Register Officer          → Get user ID
2. Login Officer             → Get token
3. View Profile              → Verify details
4. Register Admin             → Get admin ID
5. Login Admin                → Get admin token
6. Register Tuk-Tuk          → Get vehicle ID
7. List All Vehicles         → See vehicle in list
8. Get Specific Vehicle      → View by ID
9. Filter by Province        → Find Western vehicles
10. Update Location          → Change coordinates
11. View Movement History    → See tracking data
12. Test Error Cases         → Try invalid requests
```

✅ **Complete Workflow!**

---

## 💡 MongoDB Atlas Check

Your data is saved in MongoDB Atlas. After each request:
- Go to: https://cloud.mongodb.com
- Sign in with your account
- Browse collections
- See users, tuktuk, locationhistory collections
- Data persists between API calls ✅

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Server not running. Run `npm run dev` |
| 401 Unauthorized | Token missing/invalid. Check Authorization header |
| 403 Forbidden | Not admin. Use admin account for vehicle registration |
| 404 Not Found | ID doesn't exist. Check IDs in MongoDB |
| No MongoDB connection | Check `.env` MONGO_URI is correct |

---

**Everything is set up! Open Postman and start testing.** 🎉

For detailed guide, see: `MANUAL_TESTING_GUIDE.md`
