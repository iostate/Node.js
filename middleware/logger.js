/**
 * Import this middleware into the Express app
 * Always use the next() function with middleware
 * @param {} req
 * @param {*} res
 * @param {*} next
 */
const logger = (req, res, next) => {
  // Add a property to the request
  // req.hello = 'Hello World';

  // req.protocol = 'http'

  let response = `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`;
  console.log(response);
  next();
};

module.exports = logger;
