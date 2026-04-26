const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TukTuk = require('../models/TukTuk');
const LocationHistory = require('../models/LocationHistory');
const tukTukRoutes = require('../routes/tukTukRoutes');
const { authMiddleware } = require('../middleware/auth');

dotenv.config();

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  authMiddleware: (req, res, next) => next(),
  authorize: (role) => (req, res, next) => next(),
}));

let app;

describe('Advanced Querying - Filtering, Sorting, and Pagination', () => {
  let mongoConnected = false;

  beforeAll(async () => {
    // Connect to test database
    try {
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tuk_tuk_test';
      await Promise.race([
        mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('MongoDB connection timeout')), 5000)
        ),
      ]);
      mongoConnected = true;
      console.log('✓ MongoDB connected successfully');
    } catch (error) {
      console.warn('⚠ MongoDB not available - tests will be skipped');
      mongoConnected = false;
    }

    app = express();
    app.use(express.json());
    app.use('/api/tuk-tuks', tukTukRoutes);
  });

  beforeEach(async () => {
    if (!mongoConnected) {
      console.log('Skipping test - MongoDB not connected');
      return;
    }

    // Seed test data
    await TukTuk.deleteMany({});

    const testTukTuks = [
      {
        registrationNumber: 'ABC-1001',
        ownerName: 'John Doe',
        province: 'Bangkok',
        district: 'Sukhumvit',
        lastKnownLocation: { latitude: 13.7563, longitude: 100.5018, timestamp: new Date() },
      },
      {
        registrationNumber: 'ABC-1002',
        ownerName: 'Jane Smith',
        province: 'Bangkok',
        district: 'Sathorn',
        lastKnownLocation: { latitude: 13.7245, longitude: 100.5371, timestamp: new Date() },
      },
      {
        registrationNumber: 'ABC-1003',
        ownerName: 'Bob Johnson',
        province: 'Chiang Mai',
        district: 'Muang',
        lastKnownLocation: { latitude: 18.7883, longitude: 98.9853, timestamp: new Date() },
      },
      {
        registrationNumber: 'DEF-2001',
        ownerName: 'Alice Brown',
        province: 'Bangkok',
        district: 'Sukhumvit',
        lastKnownLocation: { latitude: 13.7513, longitude: 100.5018, timestamp: new Date() },
      },
      {
        registrationNumber: 'DEF-2002',
        ownerName: 'Charlie Davis',
        province: 'Phuket',
        district: 'Patong',
        lastKnownLocation: { latitude: 7.8804, longitude: 98.2962, timestamp: new Date() },
      },
    ];

    await TukTuk.insertMany(testTukTuks);
  });

  afterEach(async () => {
    await TukTuk.deleteMany({});
    await LocationHistory.deleteMany({});
  });

  afterAll(async () => {
    if (mongoConnected && mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });

  describe('Pagination', () => {
    test('should return paginated results with default page size', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks')
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.current_page).toBe(1);
      expect(response.body.pagination.per_page).toBe(10);
      expect(response.body.pagination.total).toBe(5);
      expect(response.body.pagination.total_pages).toBe(1);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    test('should return correct page when page parameter is provided', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?page=1&limit=2')
        .expect(200);

      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination.current_page).toBe(1);
      expect(response.body.pagination.per_page).toBe(2);
      expect(response.body.pagination.total_pages).toBe(3);
      expect(response.body.pagination.has_next).toBe(true);
    });

    test('should have correct has_prev and has_next flags', async () => {
      const page1 = await request(app)
        .get('/api/tuk-tuks?page=1&limit=2')
        .expect(200);

      expect(page1.body.pagination.has_prev).toBe(false);
      expect(page1.body.pagination.has_next).toBe(true);

      const page2 = await request(app)
        .get('/api/tuk-tuks?page=2&limit=2')
        .expect(200);

      expect(page2.body.pagination.has_prev).toBe(true);
      expect(page2.body.pagination.has_next).toBe(true);
    });

    test('should limit maximum page size to 100', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?limit=200')
        .expect(200);

      expect(response.body.pagination.per_page).toBeLessThanOrEqual(100);
    });

    test('should default to page 1 if page is invalid', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?page=0')
        .expect(200);

      expect(response.body.pagination.current_page).toBe(1);
    });
  });

  describe('Filtering', () => {
    test('should filter by province', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?province=Bangkok')
        .expect(200);

      expect(response.body.data.length).toBe(3);
      expect(response.body.data.every(t => t.province === 'Bangkok')).toBe(true);
      expect(response.body.pagination.total).toBe(3);
    });

    test('should filter by district', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?district=Sukhumvit')
        .expect(200);

      expect(response.body.data.length).toBe(2);
      expect(response.body.data.every(t => t.district === 'Sukhumvit')).toBe(true);
    });

    test('should filter by multiple fields (province and district)', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?province=Bangkok&district=Sukhumvit')
        .expect(200);

      expect(response.body.data.length).toBe(2);
      expect(response.body.data.every(t => t.province === 'Bangkok' && t.district === 'Sukhumvit')).toBe(true);
    });

    test('should search registrationNumber case-insensitively', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?registrationNumber=abc')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every(t => t.registrationNumber.toLowerCase().includes('abc'))).toBe(true);
    });

    test('should search ownerName case-insensitively', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?ownerName=john')
        .expect(200);

      expect(response.body.data.some(t => t.ownerName.toLowerCase().includes('john'))).toBe(true);
    });

    test('should return empty results for non-matching filter', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?province=NonExistent')
        .expect(200);

      expect(response.body.data.length).toBe(0);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe('Sorting', () => {
    test('should sort by registrationNumber ascending (default)', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?sort=registrationNumber')
        .expect(200);

      const regNumbers = response.body.data.map(t => t.registrationNumber);
      const sorted = [...regNumbers].sort();
      expect(regNumbers).toEqual(sorted);
    });

    test('should sort by registrationNumber descending', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?sort=-registrationNumber')
        .expect(200);

      const regNumbers = response.body.data.map(t => t.registrationNumber);
      const sorted = [...regNumbers].sort().reverse();
      expect(regNumbers).toEqual(sorted);
    });

    test('should sort by ownerName ascending', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?sort=ownerName')
        .expect(200);

      const ownerNames = response.body.data.map(t => t.ownerName);
      const sorted = [...ownerNames].sort();
      expect(ownerNames).toEqual(sorted);
    });

    test('should sort by province descending', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?sort=-province')
        .expect(200);

      const provinces = response.body.data.map(t => t.province);
      const sorted = [...provinces].sort().reverse();
      expect(provinces).toEqual(sorted);
    });

    test('should sort by multiple fields', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?sort=province,-registrationNumber&limit=100')
        .expect(200);

      // Verify it returns results
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Combined Filtering, Sorting, and Pagination', () => {
    test('should filter, sort, and paginate together', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?province=Bangkok&sort=-registrationNumber&page=1&limit=2')
        .expect(200);

      expect(response.body.data.length).toBe(2);
      expect(response.body.data.every(t => t.province === 'Bangkok')).toBe(true);
      expect(response.body.pagination.current_page).toBe(1);
      expect(response.body.pagination.per_page).toBe(2);
      expect(response.body.pagination.total).toBe(3);
    });

    test('should apply filter and sort in province filter route', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks/filter/province/Bangkok?sort=ownerName&page=1&limit=10')
        .expect(200);

      expect(response.body.data.every(t => t.province === 'Bangkok')).toBe(true);
      expect(response.body.pagination.total).toBe(3);
    });

    test('should apply filter and sort in district filter route', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks/filter/district/Sukhumvit?sort=-registrationNumber&page=1&limit=10')
        .expect(200);

      expect(response.body.data.every(t => t.district === 'Sukhumvit')).toBe(true);
      expect(response.body.pagination.total).toBe(2);
    });
  });

  describe('Response Format', () => {
    test('should include pagination metadata in response', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks')
        .expect(200);

      expect(response.body.pagination).toHaveProperty('current_page');
      expect(response.body.pagination).toHaveProperty('per_page');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('total_pages');
      expect(response.body.pagination).toHaveProperty('has_next');
      expect(response.body.pagination).toHaveProperty('has_prev');
    });

    test('should include filters in response when filters are applied', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?province=Bangkok')
        .expect(200);

      expect(response.body.filters).toBeDefined();
      expect(response.body.filters.province).toBe('Bangkok');
    });

    test('should include sort in response when sort is applied', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks?sort=-registrationNumber')
        .expect(200);

      expect(response.body.sort).toBeDefined();
      expect(response.body.sort.registrationNumber).toBe(-1);
    });

    test('should have null filters and sort when none are applied', async () => {
      const response = await request(app)
        .get('/api/tuk-tuks')
        .expect(200);

      expect(response.body.filters).toBeNull();
      expect(response.body.sort).toBeNull();
    });
  });
});
