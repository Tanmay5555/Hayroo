export const sendResponse = (res, statusCode, message, data = null, meta = null) => {
  const payload = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
  };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

export const sendError = (res, statusCode, message, errors = null) => {
  const payload = {
    success: false,
    message,
  };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};
