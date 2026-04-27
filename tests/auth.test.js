const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');
const standardizeResponse = require('../middleware/response');

dotenv.config();

const app = express();
app.use(express.json());
app.use(standardizeResponse);
app.use('/api/auth', authRoutes);

// Connect to test database
beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tuk_tuk_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
});

// Clean up after each test
afterEach(async () => {
  await User.deleteMany({});
});

// Close connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication Routes', () => {
  // ==================== REGISTER TESTS ====================
  describe('POST /api/auth/register', () => {
    test('Should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@police.lk',
          password: 'Password123!',
          province: 'Western',
          district: 'Colombo',
          role: 'police_officer',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.data).toHaveProperty('userId');
    });

    test('Should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@police.lk',
          // Missing password, province, district
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('details');
    });

    test('Should not register user with duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user1',
          email: 'duplicate@police.lk',
          password: 'Password123!',
          province: 'Western',
          district: 'Colombo',
        });

      // Attempt duplicate
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user2',
          email: 'duplicate@police.lk',
          password: 'Password123!',
          province: 'Western',
          district: 'Colombo',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'User already exists');
    });

    test('Should not register user with duplicate username', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicateuser',
          email: 'user1@police.lk',
          password: 'Password123!',
          province: 'Western',
          district: 'Colombo',
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicateuser',
          email: 'user2@police.lk',
          password: 'Password123!',
          province: 'Western',
          district: 'Colombo',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'User already exists');
    });

    test('Should set default role to police_officer if not provided', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'officer1',
          email: 'officer@police.lk',
          password: 'Password123!',
          province: 'Central',
          district: 'Kandy',
        });

      expect(response.status).toBe(201);
      const user = await User.findById(response.body.data.userId);
      expect(user.role).toBe('police_officer');
    });
  });

  // ==================== LOGIN TESTS ====================
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        username: 'loginuser',
        email: 'login@police.lk',
        password: 'Password123!',
        province: 'Western',
        district: 'Colombo',
        role: 'police_officer',
      });
      await user.save();
    });

    test('Should login user with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@police.lk',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('username', 'loginuser');
      expect(response.body.data.user).toHaveProperty('role', 'police_officer');
    });

    test('Should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@police.lk',
          password: 'WrongPassword!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    test('Should return 401 if user does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@police.lk',
          password: 'Password123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    test('Should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@police.lk',
          // Missing password
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('details');
    });

    test('JWT token should contain user role, province, and district', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@police.lk',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      const token = response.body.data.token;
      const decoded = require('jsonwebtoken').decode(token);
      expect(decoded).toHaveProperty('role', 'police_officer');
      expect(decoded).toHaveProperty('province', 'Western');
      expect(decoded).toHaveProperty('district', 'Colombo');
    });
  });

  // ==================== PROFILE TESTS ====================
  describe('GET /api/auth/profile', () => {
    let authToken;

    beforeEach(async () => {
      // Create test user
      const user = new User({
        username: 'profileuser',
        email: 'profile@police.lk',
        password: 'Password123!',
        province: 'Southern',
        district: 'Matara',
        role: 'admin',
      });
      await user.save();

      // Get login token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'profile@police.lk',
          password: 'Password123!',
        });
      authToken = loginRes.body.data.token;
    });

    test('Should get authenticated user profile', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('username', 'profileuser');
      expect(response.body.data).toHaveProperty('email', 'profile@police.lk');
      expect(response.body.data).toHaveProperty('role', 'admin');
      expect(response.body.data).not.toHaveProperty('password');
    });

    test('Should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'No token provided');
    });

    test('Should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });

    test('Should not return password field in profile', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).not.toHaveProperty('password');
    });
  });
});
