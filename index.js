const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const tukTukRoutes = require('./routes/tukTukRoutes');
const authRoutes = require('./routes/authRoutes');

// Import middleware
const setHttpHeaders = require('./middleware/headers');
const standardizeResponse = require('./middleware/response');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Global middleware stack
// 1. Set HTTP headers (must be before other middleware)
app.use(setHttpHeaders);

// 2. Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Standardize responses
app.use(standardizeResponse);

// Define a basic route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Tuk-Tuk Tracking API is running...' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is healthy', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tuk-tuks', tukTukRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    error: 'NOT_FOUND',
    path: req.path,
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});