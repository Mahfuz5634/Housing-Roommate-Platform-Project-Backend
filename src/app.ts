import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import { swaggerSpec } from './app/docs/swagger';

const app: Application = express();

// Security and utility middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allows Swagger UI inline scripts
}));
app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Swagger API Documentation endpoint with CDN assets for Serverless compatibility
const SWAGGER_CSS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css';
const SWAGGER_JS_URLS = [
  'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js',
  'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js',
];

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCssUrl: SWAGGER_CSS_URL,
    customJs: SWAGGER_JS_URLS,
    customSiteTitle: 'Housing & Roommate Platform API Docs',
  }),
);

// Raw OpenAPI JSON endpoint
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

// Root Health Check Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Housing & Roommate Platform Backend API is running smoothly 🚀',
    documentation: '/api-docs',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount V1 API Routes
app.use('/api/v1', router);

// Error Handling Middlewares
app.use(globalErrorHandler);
app.use(notFound);

export default app;
