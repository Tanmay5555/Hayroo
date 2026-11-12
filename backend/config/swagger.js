import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Hayroo E-Commerce API Specification',
    version: '1.0.0',
    description: 'Production-ready REST API for Hayroo e-commerce platform including Auth, Products, Cart, Orders, Payments, Admin Analytics, and Gemini AI Chatbot.',
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Development Server',
    },
  ],
  paths: {
    '/auth/login': {
      post: {
        summary: 'User & Admin Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@hayroo.com' },
                  password: { type: 'string', example: 'admin123' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Authenticated successfully' } },
      },
    },
    '/products': {
      get: {
        summary: 'List products with search, filter, and pagination',
        responses: { 200: { description: 'Product list returned' } },
      },
    },
    '/chat': {
      post: {
        summary: 'Send prompt to AI customer support chatbot',
        responses: { 200: { description: 'AI assistant reply returned' } },
      },
    },
  },
};

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
