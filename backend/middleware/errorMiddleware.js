import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  const correlationId = req.correlationId || 'none';

  console.error(
    JSON.stringify({
      level: 'error',
      correlationId,
      method: req.method,
      path: req.originalUrl,
      message: err.message,
      ...(isProd ? {} : { stack: err.stack }),
    })
  );

  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  if (err.message === 'Origin not allowed by CORS') {
    statusCode = 403;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  } else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for '${field}'. Please use another value.`;
  } else if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Requested resource could not be found';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired authentication token';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'Uploaded file exceeds the 5MB size limit';
  }

  if (isProd && statusCode === 500) {
    message = 'Internal Server Error';
  }

  sendError(res, statusCode, message, isProd ? null : err.stack);
};

export const notFoundHandler = (req, res) => {
  sendError(res, 404, `Route not found: ${req.originalUrl}`);
};
