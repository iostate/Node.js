/**
 * Creates an ErrorResponse object that consists of an
 * HTTP Status code and a message.
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
module.exports = ErrorResponse;
