class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.status = statusCode;
    // this.statusCode = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
