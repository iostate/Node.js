const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

/**
 *
 * @desc    Get all users
 * @route   GET /api/v1/users/
 * @access  Private
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

/**
 *
 * @desc    Update one user
 * @route   Put /api/v1/bootcamps/:id
 * @access  Private
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = User.findOneAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new ErrorResponse(`User with id ${req.user.id} not found`, 404));
  }

  res.status(200).json({ success: true, msg: `Update bootcamp id ${req.params.id}`, data: bootcamp });
});

/**
 *
 * @desc    Get single user
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
exports.getUser = asyncHandler(async (req, res, next) => {
  // Don't forget to add populate courses here too!
  const bootcamp = await Bootcamp.findById(req.params.id).populate('courses');
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404));
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc      Register user
// @route     GET /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });
  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

/**
 * @desc      Log a user in (Authenticate Email & Password)
 * @route     POSTG /api/v1/auth/login
 * @access    Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if an email and/or password is provided.
  if (!email || !password) {
    return next(new ErrorResponse(`Please provide an email and password`, 400));
  }

  // Check for user and also include the password as we need it for validation
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials. Please login again.', 401));
  }

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};
