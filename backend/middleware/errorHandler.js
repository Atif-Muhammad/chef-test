function errorHandler(err, req, res, next) {
  console.error('[SERVER ERROR]:', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation Error', errors: messages });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ID format: ${err.value}` });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `Duplicate value entered for ${field}.` });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ message: err.message });
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  });
}

module.exports = errorHandler;
