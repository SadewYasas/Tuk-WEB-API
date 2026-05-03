const express = require('express');
const router = express.Router();
const TukTuk = require('../models/TukTuk');
const LocationHistory = require('../models/LocationHistory');
const { authMiddleware, authorize } = require('../middleware/auth');
const { executeQuery, formatQueryResponse } = require('../utils/queryBuilder');
const validateRequest = require('../middleware/validation');
const { tukTukRegisterSchema, updateLocationSchema } = require('../schemas/tukTukSchemas');

/**
 * @swagger
 * /api/tuk-tuks/register:
 *   post:
 *     summary: Register a new tuk-tuk (Admin only)
 *     tags: [Tuk-Tuks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationNumber
 *               - ownerName
 *               - province
 *               - district
 *             properties:
 *               registrationNumber: { type: string }
 *               ownerName: { type: string }
 *               province: { type: string }
 *               district: { type: string }
 *               lastKnownLocation:
 *                 type: object
 *                 properties:
 *                   latitude: { type: number }
 *                   longitude: { type: number }
 *     responses:
 *       201:
 *         description: Tuk-tuk registered successfully
 *       409:
 *         description: Tuk-tuk already exists
 */
// Route to register a new tuk-tuk (Admin only)
router.post('/register', authMiddleware, authorize('admin'), validateRequest(tukTukRegisterSchema), async (req, res) => {
  try {
    const { registrationNumber, ownerName, province, district, lastKnownLocation } = req.validatedBody;

    // Check if registration number already exists
    const existingTukTuk = await TukTuk.findOne({ registrationNumber });
    if (existingTukTuk) {
      return res.status(409).json({
        message: 'Tuk-tuk with this registration number already exists',
        error: 'DUPLICATE_REGISTRATION',
      });
    }

    const newTukTuk = new TukTuk({
      registrationNumber,
      ownerName,
      province,
      district,
      lastKnownLocation,
    });

    const savedTukTuk = await newTukTuk.save();
    res.status(201).json({
      message: 'Tuk-tuk registered successfully',
      data: savedTukTuk,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error registering tuk-tuk',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/tuk-tuks:
 *   get:
 *     summary: Get all tuk-tuks with filtering, sorting and pagination
 *     tags: [Tuk-Tuks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: filter
 *         in: query
 *         description: Filter by field value
 *         schema: { type: string }
 *       - name: sort
 *         in: query
 *         description: Sort by field
 *         schema: { type: string }
 *       - name: page
 *         in: query
 *         description: Page number
 *         schema: { type: integer }
 *       - name: limit
 *         in: query
 *         description: Items per page
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of tuk-tuks retrieved successfully
 *       400:
 *         description: Query error
 */
// Route to get all tuk-tuks with advanced filtering, sorting, and pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await executeQuery(TukTuk, req.query, {
      allowedFilters: ['registrationNumber', 'ownerName', 'province', 'district'],
      allowedSort: ['registrationNumber', 'ownerName', 'province', 'district', 'createdAt', 'updatedAt'],
      defaultSort: 'registrationNumber',
    });

    if (!result.success) {
      return res.status(400).json({
        message: 'Error fetching tuk-tuks',
        error: result.error,
      });
    }

    res.status(200).json({
      message: 'Tuk-tuks retrieved successfully',
      data: formatQueryResponse(result),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching tuk-tuks',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/tuk-tuks/{id}:
 *   get:
 *     summary: Get a specific tuk-tuk by ID
 *     tags: [Tuk-Tuks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Tuk-tuk ID
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Tuk-tuk retrieved successfully
 *       404:
 *         description: Tuk-tuk not found
 */
// Route to get a specific tuk-tuk by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const tukTuk = await TukTuk.findById(req.params.id);
    if (!tukTuk) {
      return res.status(404).json({
        message: 'Tuk-tuk not found',
        error: 'NOT_FOUND',
      });
    }
    res.status(200).json({
      message: 'Tuk-tuk retrieved successfully',
      data: tukTuk,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving tuk-tuk',
      error: error.message,
    });
  }
});

// Route to get tuk-tuks by province (with pagination and sorting)
router.get('/filter/province/:province', authMiddleware, async (req, res) => {
  try {
    const { province } = req.params;
    const query = { ...req.query, province };

    const result = await executeQuery(TukTuk, query, {
      allowedFilters: ['registrationNumber', 'ownerName', 'province', 'district'],
      allowedSort: ['registrationNumber', 'ownerName', 'province', 'district', 'createdAt', 'updatedAt'],
      defaultSort: 'registrationNumber',
    });

    if (!result.success) {
      return res.status(400).json({
        message: 'Error fetching tuk-tuks',
        error: result.error,
      });
    }

    if (result.data.length === 0) {
      return res.status(404).json({
        message: 'No tuk-tuks found in this province',
        error: 'NOT_FOUND',
        data: [],
      });
    }

    res.status(200).json({
      message: 'Tuk-tuks retrieved successfully',
      data: formatQueryResponse(result),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching tuk-tuks',
      error: error.message,
    });
  }
});

// Route to get tuk-tuks by district (with pagination and sorting)
router.get('/filter/district/:district', authMiddleware, async (req, res) => {
  try {
    const { district } = req.params;
    const query = { ...req.query, district };

    const result = await executeQuery(TukTuk, query, {
      allowedFilters: ['registrationNumber', 'ownerName', 'province', 'district'],
      allowedSort: ['registrationNumber', 'ownerName', 'province', 'district', 'createdAt', 'updatedAt'],
      defaultSort: 'registrationNumber',
    });

    if (!result.success) {
      return res.status(400).json({
        message: 'Error fetching tuk-tuks',
        error: result.error,
      });
    }

    if (result.data.length === 0) {
      return res.status(404).json({
        message: 'No tuk-tuks found in this district',
        error: 'NOT_FOUND',
        data: [],
      });
    }

    res.status(200).json({
      message: 'Tuk-tuks retrieved successfully',
      data: formatQueryResponse(result),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching tuk-tuks',
      error: error.message,
    });
  }
});

// Route to update tuk-tuk location (Real-time tracking)
router.put('/:id/update-location', authMiddleware, validateRequest(updateLocationSchema), async (req, res) => {
  try {
    const { latitude, longitude, speed, accuracy } = req.validatedBody;

    const tukTuk = await TukTuk.findById(req.params.id);
    if (!tukTuk) {
      return res.status(404).json({
        message: 'Tuk-tuk not found',
        error: 'NOT_FOUND',
      });
    }

    // Update last known location
    tukTuk.lastKnownLocation = {
      latitude,
      longitude,
      timestamp: new Date(),
    };

    await tukTuk.save();

    // Log location in history
    const locationLog = new LocationHistory({
      tukTukId: req.params.id,
      latitude,
      longitude,
      speed: speed || 0,
      accuracy: accuracy || null,
    });

    await locationLog.save();

    res.status(200).json({
      message: 'Location updated successfully',
      data: tukTuk,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating location',
      error: error.message,
    });
  }
});

// Route to get movement history with time-based filtering and pagination
router.get('/:id/movement-history', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate tuk-tuk exists
    const tukTuk = await TukTuk.findById(req.params.id);
    if (!tukTuk) {
      return res.status(404).json({
        message: 'Tuk-tuk not found',
        error: 'NOT_FOUND',
      });
    }

    // Build query with date filters
    const query = { ...req.query, tukTukId: req.params.id };

    // Build date range filter
    let dateFilter = {};
    if (req.query.startDate) {
      dateFilter.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      dateFilter.$lte = new Date(req.query.endDate);
    }

    // Manually execute pagination and sorting for LocationHistory
    const sortParam = req.query.sort || '-timestamp';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = { tukTukId: req.params.id };
    if (Object.keys(dateFilter).length > 0) {
      filter.timestamp = dateFilter;
    }

    // Get total count
    const total = await LocationHistory.countDocuments(filter);

    // Parse sort
    const sortObject = {};
    sortParam.split(',').forEach(field => {
      let fieldName = field.trim();
      let order = 1;
      if (fieldName.startsWith('-')) {
        order = -1;
        fieldName = fieldName.substring(1);
      }
      if (['timestamp', 'speed', 'accuracy', 'latitude', 'longitude'].includes(fieldName)) {
        sortObject[fieldName] = order;
      }
    });

    // Retrieve movement history with pagination
    const history = await LocationHistory.find(filter)
      .sort(Object.keys(sortObject).length > 0 ? sortObject : { timestamp: -1 })
      .skip(skip)
      .limit(limit);

    if (history.length === 0) {
      return res.status(404).json({
        message: 'No movement history found for this tuk-tuk',
        error: 'NOT_FOUND',
        data: [],
        pagination: {
          current_page: page,
          per_page: limit,
          total: 0,
          total_pages: 0,
          has_next: false,
          has_prev: false,
        },
      });
    }

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: 'Movement history retrieved successfully',
      data: {
        tukTuk: tukTuk.registrationNumber,
        history,
        pagination: {
          current_page: page,
          per_page: limit,
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
        filters: Object.keys(filter).length > 0 ? filter : null,
        sort: Object.keys(sortObject).length > 0 ? sortObject : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving movement history',
      error: error.message,
    });
  }
});

// Route to get real-time location (Last known location)
router.get('/:id/real-time-location', authMiddleware, async (req, res) => {
  try {
    const tukTuk = await TukTuk.findById(req.params.id);
    if (!tukTuk) {
      return res.status(404).json({
        message: 'Tuk-tuk not found',
        error: 'NOT_FOUND',
      });
    }

    res.status(200).json({
      message: 'Real-time location retrieved successfully',
      data: {
        registrationNumber: tukTuk.registrationNumber,
        ownerName: tukTuk.ownerName,
        lastKnownLocation: tukTuk.lastKnownLocation,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving real-time location',
      error: error.message,
    });
  }
});

module.exports = router;