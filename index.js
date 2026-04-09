const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const tukTukRoutes = require('./routes/tukTukRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Define a basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Use TukTuk routes
app.use('/api/tuk-tuks', tukTukRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});