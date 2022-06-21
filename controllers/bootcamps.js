const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

/**
 *
 * @desc    Get all bootcamps
 * @route   GET /api/v1/bootcamps
 * @access  Public
 */
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();

  res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
});

/**
 *
 * @desc    Get single bootcamp
 * @route   GET /api/v1/bootcamps/:id
 * @access  Public
 */
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404));
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

/**
 *
 * @desc    Create new bootcamp
 * @route   POST /api/v1/bootcamps/:id
 * @access  Public
 */
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });

  // console.log(err);
  // res.status(400).json({ success: false, error: `${err.message}` });
});

/**
 *
 * @desc    Update one bootcamp
 * @route   GET /api/v1/bootcamps/:id
 * @access  Public
 */
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    // Run the mongoose validator when someone PUTs
    runValidators: true,
  });

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404));
  }

  res.status(200).json({ success: true, msg: `Update bootcamp id ${req.params.id}`, data: bootcamp });
});

/**
 *
 * @desc    Delete one bootcamp
 * @route   DELETE /api/v1/bootcamps/:id
 * @access  Public
 */
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, msg: `Deleted bootcamp id ${req.params.id}`, data: {} });
});
