import { sendError } from '../utils/response.js';

export const handleMulterError = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'File size exceeds 10MB limit', 400);
  }
  if (err.message && err.message.includes('Only jpg')) {
    return sendError(res, err.message, 400);
  }
  next(err);
};

export const globalErrorHandler = (err, req, res, _next) => {
  console.error('[ERROR]', err);

  if (err.code === 'P2002') {
    return sendError(res, 'A record with this value already exists', 409);
  }
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found', 404);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  return sendError(res, message, statusCode);
};
