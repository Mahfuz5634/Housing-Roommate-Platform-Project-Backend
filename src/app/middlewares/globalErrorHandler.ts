import { ErrorRequestHandler } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { Prisma } from '@prisma/client';
import ApiError from '../errors/ApiError';
import config from '../config';

type TErrorSources = {
  path: string | number;
  message: string;
}[];

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorSources = err.issues.map((issue: ZodIssue) => {
      return {
        path: issue.path[issue.path.length - 1],
        message: issue.message,
      };
    });
  }
  // 2. Prisma Known Request Error
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Duplicate key value violates unique constraint';
      const target = (err.meta?.target as string[]) || [];
      errorSources = [
        {
          path: target.join(', '),
          message: `A record with this ${target.join(', ')} already exists`,
        },
      ];
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Resource not found';
      errorSources = [
        {
          path: '',
          message: (err.meta?.cause as string) || 'Record not found in database',
        },
      ];
    } else {
      statusCode = 400;
      message = err.message || 'Database error occurred';
      errorSources = [
        {
          path: '',
          message: err.message,
        },
      ];
    }
  }
  // 3. Prisma Validation Error
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Validation Error in database query';
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];
  }
  // 4. Custom ApiError
  else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];
  }
  // 5. Native Error
  else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: config.env === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;
