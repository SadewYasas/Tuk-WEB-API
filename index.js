const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const tukTukRoutes = require('./routes/tukTukRoutes');
const authRoutes = require('./routes/authRoutes');
const swaggerUi = require('swagger-ui-express');

// Import middleware
const setHttpHeaders = require('./middleware/headers');
const standardizeResponse = require('./middleware/response');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Tuk-Tuk Tracking API',
    version: '1.0.0',
    description: 'Swagger documentation for the Tuk-Tuk Tracking API',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        summary: 'API health check',
        responses: {
          '200': { description: 'API is running' },
        },
      },
    },
    '/health': {
      get: {
        summary: 'Server health status',
        responses: {
          '200': { description: 'Server is healthy' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string' },
                  province: { type: 'string' },
                  district: { type: 'string' },
                },
                required: ['username', 'email', 'password'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'User registered successfully' },
          '400': { description: 'Invalid input' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Authenticate user and return JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/profile': {
      get: {
        summary: 'Get authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'User profile retrieved successfully' },
          '401': { description: 'Authentication required' },
        },
      },
    },
    '/api/tuk-tuks': {
      get: {
        summary: 'List tuk-tuks with filtering and pagination',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Tuk-tuks retrieved successfully' },
          '401': { description: 'Authentication required' },
        },
      },
    },
  },
};

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

// Swagger docs endpoint
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});