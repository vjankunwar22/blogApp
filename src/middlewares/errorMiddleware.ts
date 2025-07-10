import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../types/error';

const errorMiddleware = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  // Log the error for debugging
  console.error(err);

  // If the error has a status code, use it; otherwise, default to 500
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
    // Optionally include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString(),   
  });
};

export default errorMiddleware;



