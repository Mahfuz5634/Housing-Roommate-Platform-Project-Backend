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

// Swagger API Documentation endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
