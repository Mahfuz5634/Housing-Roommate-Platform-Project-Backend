import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Housing & Roommate Platform API',
      version: '1.0.0',
      description:
        'RESTful API for Housing and Roommate Platform (B7A6 Assignment). Features: JWT Auth, Google GCP Login, Roommate Compatibility Matching Engine, Property & Room Management, Stripe Payments, Maintenance Workflows, and Admin Moderation.',
      contact: {
        name: 'Mahfuz',
        email: 'mahfuzru5634@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/app/modules/**/*.ts', './src/app/routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
