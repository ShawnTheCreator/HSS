// routes/geocode.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/geocode', async (req, res) => {
  try {
    const { lat, lon } = req.body;

    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return res.status(400).json({ error: 'Latitude and longitude are required as numbers' });
    }

    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'json',
        lat,
        lon,
      },
      headers: {
        'User-Agent': 'HSS-Geocoder/1.0 (your@email.com)',
      },
    });

    if (!response.data.address) {
      return res.status(500).json({ error: 'No address found' });
    }

    res.json({ address: response.data.address });
  } catch (error) {
    console.error('[GEOCODE ERROR]', error.message);
    res.status(500).json({ error: 'Reverse geocoding failed', details: error.message });
  }
});

module.exports = router;
