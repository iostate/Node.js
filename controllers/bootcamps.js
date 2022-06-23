const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');

/**
 *
 * @desc    Get all bootcamps
 * @route   GET /api/v1/bootcamps
 * @access  Public
 */
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;
  let queryStr = JSON.stringify(req.query);

  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  console.log(queryStr);
  query = await Bootcamp.find(JSON.parse(queryStr));
  const bootcamps = await query;

  res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
});

/**
 *
 * @desc    Get single bootcamp
 * @route   GET /api/v1/bootcamps/:id
 * @access  Public
 */
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  console.log(req.params);
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
  // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  console.log(req);
  const bootcamp = await Bootcamp.findOneAndDelete(req.params);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }

  console.log(res);
  console.log(req);

  res.status(200).json({ success: true, msg: `Deleted bootcamp id ${req.params.id}`, data: {} });
});

/**
 *
 * @desc    Get bootcamps within a radius
 * @route   Get /api/v1/bootcamps/radius/:zipcode/:distance
 * @access  Public
 */
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/longitude from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radians udian radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963; // miles
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
