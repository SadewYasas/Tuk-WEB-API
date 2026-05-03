const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tuk-Tuk Tracking API',
      version: '1.0.0',
      description: 'API for tracking and managing Tuk-Tuk vehicles with user authentication',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
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
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'police_officer', 'driver'] },
            province: { type: 'string' },
            district: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        TukTuk: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            registrationNumber: { type: 'string' },
            ownerName: { type: 'string' },
            province: { type: 'string' },
            district: { type: 'string' },
            lastKnownLocation: {
              type: 'object',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
