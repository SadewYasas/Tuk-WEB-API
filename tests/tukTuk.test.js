const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const TukTuk = require('../models/TukTuk');
const LocationHistory = require('../models/LocationHistory');
const authRoutes = require('../routes/authRoutes');
const tukTukRoutes = require('../routes/tukTukRoutes');
const standardizeResponse = require('../middleware/response');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(express.json());
app.use(standardizeResponse);
app.use('/api/auth', authRoutes);
app.use('/api/tuk-tuks', tukTukRoutes);

let adminToken, officerToken, adminUser, officerUser;

// Connect to test database
beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tuk_tuk_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create test users
    adminUser = new User({
      username: 'admin',
      email: 'admin@police.lk',
      password: 'AdminPass123!',
      province: 'Western',
      district: 'Colombo',
      role: 'admin',
    });
    await adminUser.save();

    officerUser = new User({
      username: 'officer',
      email: 'officer@police.lk',
      password: 'OfficerPass123!',
      province: 'Central',
      district: 'Kandy',
      role: 'police_officer',
    });
    await officerUser.save();

    // Get tokens
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@police.lk',
        password: 'AdminPass123!',
      });
    adminToken = adminRes.body.data.token;

    const officerRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'officer@police.lk',
        password: 'OfficerPass123!',
      });
    officerToken = officerRes.body.data.token;
  } catch (error) {
    console.error('Setup error:', error);
  }
});

// Clean up after each test
afterEach(async () => {
  await TukTuk.deleteMany({});
  await LocationHistory.deleteMany({});
});

// Close connection after all tests
afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Tuk-Tuk Routes', () => {
  // ==================== REGISTER TUK-TUK TESTS ====================
  describe('POST /api/tuk-tuks/register', () => {
    test('Should register new tuk-tuk (Admin only)', async () => {
      const response = await request(app)
        .post('/api/tuk-tuks/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          registrationNumber: 'ABC-1234',
          ownerName: 'John Doe',
          province: 'Western',
          district: 'Colombo',
          lastKnownLocation: {
            latitude: 6.9271,
            longitude: 80.7789,
          },
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('registrationNumber', 'ABC-1234');
      expect(response.body.data).toHaveProperty('province', 'Western');
    });

    test('Should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/tuk-tuks/register')
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          registrationNumber: 'ABC-5678',
          ownerName: 'Jane Doe',
          province: 'Western',
          district: 'Colombo',
          lastKnownLocation: {
            latitude: 6.9271,
            longitude: 80.7789,
          },
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Access denied');
    });

    test('Should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/tuk-tuks/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          registrationNumber: 'ABC-9999',
          // Missing ownerName, province, district
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('details');
    });

    test('Should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/tuk-tuks/register')
        .send({
          registrationNumber: 'ABC-1111',
          ownerName: 'Test Owner',
          province: 'Western',
          district: 'Colombo',
        });

      expect(response.status).toBe(401);
    });
  });

  // ==================== GET ALL TUK-TUKS TESTS ====================
  describe('GET /api/tuk-tuks', () => {
    beforeEach(async () => {
      // Create multiple tuk-tuks
      await TukTuk.create([
        {
          registrationNumber: 'CAB-001',
          ownerName: 'Owner1',
          province: 'Western',
          district: 'Colombo',
          lastKnownLocation: { latitude: 6.9271, longitude: 80.7789 },
        },
        {
          registrationNumber: 'CAB-002',
          ownerName: 'Owner2',
          province: 'Central',
          district: 'Kandy',
          lastKnownLocation: { latitude: 7.2906, longitude: 80.6337 },
        },
        {
          registrationNumber: 'CAB-003',
          ownerName: 'Owner3',
          province: 'Southern',
          district: 'Matara',
          lastKnownLocation: { latitude: 5.7489, longitude: 80.7853 },
        },
      ]);
    });

    test('Should get all tuk-tuks (Authenticated user)', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);
    });

    test('Should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks');

      expect(response.status).toBe(401);
    });
  });

  // ==================== GET TUK-TUK BY ID TESTS ====================
  describe('GET /api/tuk-tuks/:id', () => {
    let tukTukId;

    beforeEach(async () => {
      const tukTuk = await TukTuk.create({
        registrationNumber: 'CAB-100',
        ownerName: 'TestOwner',
        province: 'Western',
        district: 'Colombo',
        lastKnownLocation: { latitude: 6.9271, longitude: 80.7789 },
      });
      tukTukId = tukTuk._id;
    });

    test('Should get tuk-tuk by ID', async () => {
      const response = await request(app)
        .get(`/api/tuk-tuks/${tukTukId}`)
        .set('Authorization', `Bearer ${officerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('registrationNumber', 'CAB-100');
      expect(response.body.data).toHaveProperty('ownerName', 'TestOwner');
    });

    test('Should return 404 for non-existent tuk-tuk', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/tuk-tuks/${fakeId}`)
        .set('Authorization', `Bearer ${officerToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Tuk-tuk not found');
    });
  });

  // ==================== FILTER BY PROVINCE TESTS ====================
  describe('GET /api/tuk-tuks/filter/province/:province', () => {
    beforeEach(async () => {
      await TukTuk.create([
        {
          registrationNumber: 'WES-001',
          ownerName: 'Western Owner',
          province: 'Western',
          district: 'Colombo',
          lastKnownLocation: { latitude: 6.9271, longitude: 80.7789 },
        },
        {
          registrationNumber: 'WES-002',
          ownerName: 'Western Owner 2',
          province: 'Western',
          district: 'Galle',
          lastKnownLocation: { latitude: 6.0535, longitude: 80.2179 },
        },
        {
          registrationNumber: 'CEN-001',
          ownerName: 'Central Owner',
          province: 'Central',
          district: 'Kandy',
          lastKnownLocation: { latitude: 7.2906, longitude: 80.6337 },
        },
      ]);
    });

    test('Should filter tuk-tuks by province', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks/filter/province/Western')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      response.body.data.forEach((tuk) => {
        expect(tuk.province).toBe('Western');
      });
    });

    test('Should return 404 if no tuk-tuks found in province', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks/filter/province/NonExistent')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'No tuk-tuks found in this province');
    });
  });

  // ==================== FILTER BY DISTRICT TESTS ====================
  describe('GET /api/tuk-tuks/filter/district/:district', () => {
    beforeEach(async () => {
      await TukTuk.create([
        {
          registrationNumber: 'CMB-001',
          ownerName: 'Colombo Owner 1',
          province: 'Western',
          district: 'Colombo',
          lastKnownLocation: { latitude: 6.9271, longitude: 80.7789 },
        },
        {
          registrationNumber: 'CMB-002',
          ownerName: 'Colombo Owner 2',
          province: 'Western',
          district: 'Colombo',
          lastKnownLocation: { latitude: 6.9272, longitude: 80.7790 },
        },
        {
          registrationNumber: 'KDY-001',
          ownerName: 'Kandy Owner',
          province: 'Central',
          district: 'Kandy',
          lastKnownLocation: { latitude: 7.2906, longitude: 80.6337 },
        },
      ]);
    });

    test('Should filter tuk-tuks by district', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks/filter/district/Colombo')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      response.body.data.forEach((tuk) => {
        expect(tuk.district).toBe('Colombo');
      });
    });

    test('Should return 404 if no tuk-tuks found in district', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks/filter/district/InvalidDistrict')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'No tuk-tuks found in this district');
    });
  });

  // ==================== UPDATE LOCATION TESTS ====================
  describe('PUT /api/tuk-tuks/:id/update-location', () => {
    let tukTukId;

    beforeEach(async () => {
      const tukTuk = await TukTuk.create({
        registrationNumber: 'LOC-001',
        ownerName: 'Location Test',
        province: 'Western',
        district: 'Colombo',
        lastKnownLocation: { latitude: 6.9271, longitude: 80.7789 },
      });
      tukTukId = tukTuk._id;
    });

    test('Should update tuk-tuk location (Real-time tracking)', async () => {
      const response = await request(app)
        .put(`/api/tuk-tuks/${tukTukId}/update-location`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          latitude: 7.0,
          longitude: 80.8,
          speed: 45,
          accuracy: 5,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('lastKnownLocation');

      // Verify location was updated in DB
      const updatedTuk = await TukTuk.findById(tukTukId);
      expect(updatedTuk.lastKnownLocation.latitude).toBe(7.0);
      expect(updatedTuk.lastKnownLocation.longitude).toBe(80.8);
    });

    test('Should create location history entry on update', async () => {
      await request(app)
        .put(`/api/tuk-tuks/${tukTukId}/update-location`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          latitude: 7.1,
          longitude: 80.9,
          speed: 50,
          accuracy: 5,
        });

      const history = await LocationHistory.find({ tukTukId });
      expect(history.length).toBeGreaterThan(0);
    });

    test('Should return 400 if coordinates are missing', async () => {
      const response = await request(app)
        .put(`/api/tuk-tuks/${tukTukId}/update-location`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          speed: 45,
          // Missing latitude and longitude
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('details');
    });

    test('Should return 404 for non-existent tuk-tuk', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/tuk-tuks/${fakeId}/update-location`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          latitude: 7.0,
          longitude: 80.8,
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Tuk-tuk not found');
    });

    test('Should record speed and accuracy in location history', async () => {
      await request(app)
        .put(`/api/tuk-tuks/${tukTukId}/update-location`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          latitude: 7.0,
          longitude: 80.8,
          speed: 60,
          accuracy: 10,
        });

      const history = await LocationHistory.findOne({ tukTukId });
      expect(history.speed).toBe(60);
      expect(history.accuracy).toBe(10);
    });
  });
});
