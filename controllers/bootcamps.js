/**
 * Comparison Query Operators:
 * https://www.mongodb.com/docs/manual/reference/operator/query-comparison/
 *
 * Field Names with Periods (.) and Dollar Signs ($):
 * https://www.mongodb.com/docs/manual/core/dot-dollar-considerations/
 *
 */
const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');

/**
 *
 * @desc    Create new bootcamp
 * @route   POST /api/v1/bootcamps/:id
 * @access  Public
 */
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to the request body
  req.body.user = req.user.id;

  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // If user not an admin, allow only one bootcamp to be added
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 400));
  }

  // Since there was no bootcamp found, we will create the Bootcamp
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

/**
 *
 * @desc    Get all bootcamps
 * @route   GET /api/v1/bootcamps
 * @access  Public
 */
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

/**
 *
 * @desc    Get single bootcamp
 * @route   GET /api/v1/bootcamps/:id
 * @access  Public
 */
exports.getBootcamp = asyncHandler(async (req, res, next) => {
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

/**
 *
 * @desc    Update one bootcamp
 * @route   GET /api/v1/bootcamps/:id
 * @access  Public
 */
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  // When updating a resource, don't use the findByIdAndUpdate method right away.
  // Use it at the end. l
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404));
  }

  if ((!bootcamp.user || bootcamp.user.toString() !== req.user.id) && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401));
  }

  bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('courses');

  res.status(200).json({ success: true, msg: `Update bootcamp id ${req.params.id}`, data: bootcamp });
});

/**
 *
 * @desc    Delete one bootcamp
 * @route   DELETE /api/v1/bootcamps/:id
 * @access  Public
 */
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }

  if ((!bootcamp.user || bootcamp.user.toString() !== req.user.id) && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401));
  }

  bootcamp.remove();
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

/**
 *
 * @desc    POST Photo of Bootcamp
 * @route   POST /api/v1/bootcamps/:id/photos
 * @access  Public
 */
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }

  console.log(bootcamp.user);

  if ((!bootcamp.user || bootcamp.user.toString() !== req.user.id) && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401));
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload files`, 400));
  }

  const file = req.files.file; // Uploaded file

  // Ensure the file uploaded is an image
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }
  // Ensure the file size does not exceed 27398612 bytes
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
  }

  // Create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  file.name = `${process.env.FILE_UPLOAD_PATH}${file.name}`;
  // Move the file to /public/uploads/{{file.name}} folder
  file.mv(`${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
  });

  // Update the bootcamp with the new photo
  await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

  res.status(200).json({
    success: true,
    // Return filename upon success
    data: file.name,
  });
});
