const axios = require('axios');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTU3ZTI5MmViNGNiOWZmNDFiYjU4MmUiLCJlbWFpbElkIjoiZGVtb191c2VyIiwiaG9zcGl0YWxEYk5hbWUiOiJoc3NfZGVtb19ob3NwaXRhbCIsImhvc3BpdGFsTmFtZSI6IkhTUyBEZW1vIEhvc3BpdGFsIiwicm9sZSI6Imhvc3BpdGFsX2FkbWluIiwiZW1haWwiOiJkZW1vQGhzcy1zeXN0ZW0uY29tIiwiY29udGFjdFBlcnNvbk5hbWUiOiJEZW1vIFVzZXIiLCJpYXQiOjE3NjczNjgyNTIsImV4cCI6MTc2NzQ1NDY1Mn0.0mmGq9VWJ1vKZ2tpmRrz6WLacr5XfB8MSTOA62FKGeo";

async function check() {
  try {
    console.log('Fetching stats...');
    const res = await axios.get('http://localhost:5000/api/auth/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Stats Response:', res.data);
  } catch (err) {
    console.error('Error fetching stats:', err.response ? err.response.data : err.message);
  }

  try {
    console.log('Fetching alerts...');
    const res = await axios.get('http://localhost:5000/api/auth/dashboard/alerts', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Alerts Response:', res.data);
  } catch (err) {
    console.error('Error fetching alerts:', err);
  }
}

check();
