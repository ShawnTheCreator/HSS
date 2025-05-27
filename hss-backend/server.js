const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => console.log('Server running...'));
  })
  .catch((err) => console.error(err));
