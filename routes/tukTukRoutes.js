const express = require('express');
const router = express.Router();
const TukTuk = require('../models/TukTuk');
const LocationHistory = require('../models/LocationHistory');
const { authMiddleware, authorize } = require('../middleware/auth');

// Route to register a new tuk-tuk (Admin only)
router.post('/register', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const { registrationNumber, ownerName, province, district, lastKnownLocation } = req.body;

    // Validate input
    if (!registrationNumber || !ownerName || !province || !district) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const newTukTuk = new TukTuk({
      registrationNumber,
      ownerName,
      province,
      district,
      lastKnownLocation,
    });

    const savedTukTuk = await newTukTuk.save();
    res.status(201).json(savedTukTuk);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route to get all tuk-tuks (Authenticated users)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tukTuks = await TukTuk.find();
    res.json(tukTuks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get a specific tuk-tuk by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const tukTuk = await TukTuk.findById(req.params.id);
    if (!tukTuk) {
      return res.status(404).json({ message: 'Tuk-tuk not found' });
    }
    res.json(tukTuk);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get tuk-tuks by province
router.get('/filter/province/:province', authMiddleware, async (req, res) => {
  try {
    const { province } = req.params;
    const tukTuks = await TukTuk.find({ province });
    
    if (tukTuks.length === 0) {
      return res.status(404).json({ message: 'No tuk-tuks found in this province' });
    }
    
    res.json(tukTuks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get tuk-tuks by district
router.get('/filter/district/:district', authMiddleware, async (req, res) => {
  try {
    const { district } = req.params;
    const tukTuks = await TukTuk.find({ district });
    
    if (tukTuks.length === 0) {
      return res.status(404).json({ message: 'No tuk-tuks found in this district' });
    }
    
    res.json(tukTuks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to update tuk-tuk location (Real-time tracking)
router.put('/:id/update-location', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, speed, accuracy } = req.body;

    // Validate coordinates
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const tukTuk = await TukTuk.findById(req.params.id);
    if (!tukTuk) {
      return res.status(404).json({ message: 'Tuk-tuk not found' });
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

    res.json({ message: 'Location updated successfully', tukTuk });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get movement history with time-based filtering
router.get('/:id/movement-history', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate tuk-tuk exists
    const tukTuk = await TukTuk.findById(req.params.id);
    if (!tukTuk) {
      return res.status(404).json({ message: 'Tuk-tuk not found' });
    }

    // Build query
    let query = { tukTukId: req.params.id };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    // Retrieve movement history sorted by timestamp
    const history = await LocationHistory.find(query).sort({ timestamp: -1 });

    if (history.length === 0) {
      return res.status(404).json({ message: 'No movement history found for this tuk-tuk' });
    }

    res.json({ tukTuk: tukTuk.registrationNumber, history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get real-time location (Last known location)
router.get('/:id/real-time-location', authMiddleware, async (req, res) => {
  try {
    const tukTuk = await TukTuk.findById(req.params.id);
    if (!tukTuk) {
      return res.status(404).json({ message: 'Tuk-tuk not found' });
    }

    res.json({
      registrationNumber: tukTuk.registrationNumber,
      ownerName: tukTuk.ownerName,
      lastKnownLocation: tukTuk.lastKnownLocation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;