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
 * @desc    Get all bootcamps
 * @route   GET /api/v1/bootcamps
 * @access  Public
 */
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // let query;

  // const reqQuery = { ...req.query };

  // const removeFields = ['select', 'sort', 'page', 'limit'];

  // removeFields.forEach((param) => delete reqQuery[param]);

  // // Turn the query into JSON
  // let queryStr = JSON.stringify(req.query);

  // // Prepending $ to a comparison query operator
  // queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  // query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

  // // Handle select operator
  // if (req.query.select) {
  //   const fields = req.query.select.split(',').join(' ');
  //   console.log(fields); // -> 'name description'
  //   // query = await Bootcamp.find(JSON.parse(queryStr)).select(fields);
  //   query = query.select(fields);
  //   console.log(query);
  // }

  // // Handle sort operator
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   // console.log(fields);
  //   // query = await Bootcamp.find(JSON.parse(queryStr)).sort(fields);
  //   // Sort in ASC order
  //   query = query.sort(sortBy);
  // } else {
  //   // Sort in DESC order
  //   query = query.sort('-createdAt');
  // }

  // const page = parseInt(req.query.page, 10) || 1;
  // const limit = parseInt(req.query.limit, 10) || 1;
  // const startIndex = (page - 1) * limit;
  // const endIndex = page * limit;
  // const total = await Bootcamp.countDocuments();

  // const bootcamps = await query;

  // const pagination = {};
  // // Will return only if we're not at the end of endIndex
  // if (endIndex < total) {
  //   pagination.next = {
  //     page: page + 1,
  //     limit,
  //   };
  // }

  // // Will always except at 0 lol
  // if (startIndex > 0) {
  //   pagination.prev = {
  //     page: page - 1,
  //     limit,
  //   };
  // }

  // res.status(200).json({ success: true, count: bootcamps.length, pagination, data: bootcamps });
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
  }).populate('courses');

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
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
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
