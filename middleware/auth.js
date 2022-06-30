const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

/**
 * Provides the access modifier like behavior in the server.
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  // @todo remove debugging logs on prod
  console.log('Authorizing request .....');
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    console.log('Authorization is a big fat fail.');
    return next(new ErrorResponse(`Not authorized to access this route`, 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // console.log('decoded: ');
    // console.log(decoded);

    console.log('Authorization granted...');
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    console.log('Authorization is a big fat fail.');
    return next(new ErrorResponse(`Not Authorized to access this route`, 401));
  }
});

// Authenticate the self, route is api/v1/auth/me
exports.getMe = asyncHandler(async (req, res, next) => {
  // console.log(req);
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`Your role ${req.user.role} is not authorized to access this route`, 403));
    }
    next();
  };
};
