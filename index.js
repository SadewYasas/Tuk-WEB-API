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

const swaggerSpecTemplate = {
  openapi: '3.0.0',
  info: {
    title: 'Tuk-Tuk Tracking API',
    version: '1.0.0',
    description: 'Swagger documentation for the Tuk-Tuk Tracking API',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      UserCredentials: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      RegisterUser: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          role: { type: 'string' },
          province: { type: 'string' },
          district: { type: 'string' },
        },
        required: ['username', 'email', 'password'],
      },
      UpdateLocation: {
        type: 'object',
        properties: {
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          speed: { type: 'number' },
          accuracy: { type: 'number' },
        },
        required: ['latitude', 'longitude'],
      },
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
              schema: { $ref: '#/components/schemas/RegisterUser' },
            },
          },
        },
        responses: {
          '201': { description: 'User registered successfully' },
          '400': { description: 'Invalid input', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
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
              schema: { $ref: '#/components/schemas/UserCredentials' },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/auth/profile': {
      get: {
        summary: 'Get authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'User profile retrieved successfully' },
          '401': { description: 'Authentication required', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
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
    '/api/tuk-tuks/register': {
      post: {
        summary: 'Register a new tuk-tuk',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  registrationNumber: { type: 'string' },
                  ownerName: { type: 'string' },
                  province: { type: 'string' },
                  district: { type: 'string' },
                  lastKnownLocation: { type: 'object' },
                },
                required: ['registrationNumber', 'ownerName', 'province', 'district', 'lastKnownLocation'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'Tuk-tuk registered successfully' },
          '400': { description: 'Invalid input' },
        },
      },
    },
    '/api/tuk-tuks/{id}': {
      get: {
        summary: 'Get a specific tuk-tuk by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Tuk-tuk retrieved successfully' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/tuk-tuks/{id}/update-location': {
      put: {
        summary: 'Update tuk-tuk location',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateLocation' },
            },
          },
        },
        responses: {
          '200': { description: 'Location updated successfully' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/tuk-tuks/{id}/movement-history': {
      get: {
        summary: 'Get tuk-tuk movement history',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Movement history retrieved successfully' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/tuk-tuks/{id}/real-time-location': {
      get: {
        summary: 'Get real-time tuk-tuk location',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Real-time location retrieved successfully' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/tuk-tuks/filter/province/{province}': {
      get: {
        summary: 'List tuk-tuks filtered by province',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'province', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Tuk-tuks retrieved successfully' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/tuk-tuks/filter/district/{district}': {
      get: {
        summary: 'List tuk-tuks filtered by district',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'district', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Tuk-tuks retrieved successfully' },
          '404': { description: 'Not found' },
        },
      },
    },
  },
};

const getSwaggerSpec = (req) => {
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return {
    ...swaggerSpecTemplate,
    servers: [
      {
        url: baseUrl,
        description: 'API server',
      },
    ],
  };
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
app.use('/api/docs', swaggerUi.serve, (req, res, next) => {
  const swaggerSpec = getSwaggerSpec(req);
  return swaggerUi.setup(swaggerSpec, { explorer: true })(req, res, next);
});
app.get('/api/docs.json', (req, res) => {
  res.json(getSwaggerSpec(req));
});

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