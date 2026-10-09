import { Server } from 'http';
import app from './app';
import config from './app/config';

let server: Server;

async function bootstrap() {
  try {
    server = app.listen(config.port, () => {
      console.log(`🚀 Housing & Roommate Platform Server is running on port ${config.port}`);
      console.log(`📚 API Documentation available at http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.log('Server closed successfully.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception detected:', error);
    exitHandler();
  });

  process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection detected:', error);
    exitHandler();
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Shutting down gracefully.');
    exitHandler();
  });
}

bootstrap();
