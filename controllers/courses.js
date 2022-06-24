const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

/**
 *
 * @desc    Get all courses
 * @route   GET /api/v1/courses
 * @route   GET /api/v1/bootcamps/:bootcampId/courses
 * @access  Public
 */
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    console.log(req.params.bootcampId);
    // omit await here.. but populate query with mongoose.Query to use its functionality
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    // Only return the name & description field with the courses
    query = Course.find().populate({
      path: 'bootcamp',
      select: 'name description',
    });
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

/**
 *
 * @desc    Get single bootcamp
 * @route   GET /api/v1/bootcamps/:id
 * @access  Public
 */
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  if (!course) {
    return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: course,
  });
});

// POST REQUEST TO
// {{URL}}/api/v1/bootcamps/5d713995b721c3bb38c1f5d0/courses
exports.addCourse = asyncHandler(async (req, res, next) => {
  // getCourse gets called before as you requested
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));
  }

  const course = await Course.create(req.body);

  res.status(200).json({ success: true, data: course });
});
