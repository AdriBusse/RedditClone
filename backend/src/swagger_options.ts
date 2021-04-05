import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Readit api doc',
      version: '0.1.0',
      description: 'This is a test with swagger for docuent my endpoints',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'AdriBusse',
        email: 'adri.busse@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
      },
    ],
  },
  apis: ['./routes/**/*{.ts,.js}'],
};

export default options;
