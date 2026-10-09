import { Request, Response } from 'express';
import httpStatus from 'http-status';

const notFound = (req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: `API endpoint not found: [${req.method}] ${req.originalUrl}`,
    errorSources: [
      {
        path: req.originalUrl,
        message: 'The requested route does not exist on this server.',
      },
    ],
  });
};

export default notFound;
