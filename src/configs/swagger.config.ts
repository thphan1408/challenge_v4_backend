import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

// Tối giản: tài liệu hoá /health và group routes. Bạn có thể build OpenAPI đầy đủ sau.
const minimalDoc = {
  openapi: '3.0.0',
  info: { title: 'Challenge_V4 API', version: '1.0.0' },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': { description: 'OK' },
        },
      },
    },
  },
};

export function mountSwagger(app: Application) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(minimalDoc));
}
