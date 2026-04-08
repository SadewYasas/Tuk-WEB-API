const express = require('express');
const router = express.Router();
const TukTuk = require('../models/TukTuk');

// Route to register a new tuk-tuk
router.post('/register', async (req, res) => {
  try {
    const { registrationNumber, ownerName, province, district, lastKnownLocation } = req.body;

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

// Route to get all tuk-tuks
router.get('/', async (req, res) => {
  try {
    const tukTuks = await TukTuk.find();
    res.json(tukTuks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;