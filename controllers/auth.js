const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

/**
 *
 * @desc    Update one user
 * @route   Put /api/v1/users
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

  res.status(200).json({ success: true, msg: `Updated user id ${req.params.id}`, data: user });
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

/**
 * @desc      Get current logged in user
 *  @route     POST /api/v1/auth/me
 * @access    Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
});

/**
 *
 * @desc    Update one user
 * @route   Put /api/v1/users
 * @access  Private
 */
exports.updateDetails = asyncHandler(async (req, res, next) => {
  console.log(req.user.id);
  console.log(req.body);
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new ErrorResponse(`User with id ${req.user.id} not found`, 404));
  }

  res.status(200).json({ success: true, msg: `Updated user w/ id: ${req.user.id}`, data: user });
});

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

/**
 *
 * Forgot password functionality.
 * Created a function in User Schema called getResetPasswordToken()
 * Works with UserSchema.resetPasswordToken and UserSchema.resetPasswordExpire
 * @desc    Sends an email to reset the user's password
 * @route   POST /api/v1/forgotpassword
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse(`There is no user with email ${req.body.email}`, 404));
  }

  // Get reset Token
  // Resets two properties of the UserSchema, resetPasswordToken & resetPasswordExpire
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create the reeset URL for the user to visit
  // Currently sends an email asking to make a PUT rquest to following email...
  // @note The route for resetPassword/:resetToken is case-sensitive.
  // The camelcase must match in the resetPassword function as well as
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });
    res.status(200).json({
      success: true,
      data: 'Email sent',
    });
  } catch (err) {
    console.log(err);
    user.getResetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse(`Email could not be sent`, 500));
  }
});
/**
 *
 * Forgot password functionality.
 * Created a function in User Schema called getResetPasswordToken()
 * Works with UserSchema.resetPasswordToken and UserSchema.resetPasswordExpire
 * @desc    Sends an email to reset the user's password
 * @route   POST /api/v1/forgotpassword
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  // @note The route and the req.params.resetToken are CASE SENSITIVE
  // In routes, specify ..../:resetToken with a capital T. Else you
  // will receive an error

  // resetToken is passed on from the forgotpassword fn()
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  // Find this user based on the reset password expire being greater than
  // RIGHT NOW.It will find the First Document whose resetPasswordExpire
  // field is greather than right now.

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password because they are going to send the password in the request body
  // The password will get encrypted because of our UserSchema.pre('save') middleware
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
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
