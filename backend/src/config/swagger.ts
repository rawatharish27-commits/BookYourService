import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BookYourService API',
      version: '1.0.0',
      description:
        'API documentation for the BookYourService platform. This provides endpoints for user authentication, booking management, provider services, and administrative tasks.',
      contact: {
        name: 'Support',
        url: 'https://bookyourservice.co.in/support',
        email: 'support@bookyourservice.co.in',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: 'Development server',
      },
      {
        url: 'https://api.bookyourservice.co.in',
        description: 'Production server',
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
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Paths to files containing OpenAPI definitions
  apis: ['./src/app.ts', './src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
