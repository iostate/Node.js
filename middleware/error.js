const ErrorResponse = require('../utils/errorResponse');

/**
 * Handle errors. Construct a response to send back to the client
 * if an error is encountered.
 * @param {} err
 * @param {*} req
 * @param {*} res
 * @param {*} next Express.js error-handling callback
 */
const errorHandler = (err, req, res, next) => {
  // Initialize an error object for our custom ErrorResponse
  let error = { ...err };
  error.message = err.message;
  // Log to console for dev
  // Prints out fields that we can USE to perform even better error validation!
  console.log(err);

  // Mongoose bad ObjectId - Handle error if bootcamp not found by id
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  // POST Error Handling - Duplicate name value entered.
  // There cannot be 2 bootcamps with the same name in the database.
  if (err.code === 11000) {
    const message = `Duplicate field value entered. \nValue = ${JSON.stringify(err.keyValue)}`;
    error = new ErrorResponse(message, 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  // Our new nicely formatted error
  // console.log(error);

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
