const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Add a course to a bootcamp.
 * POST REQUEST TO
 * {{URL}}/api/v1/bootcamps/5d713995b721c3bb38c1f5d0/courses
 * @desc      Add course
 * @route     POST /api/v1/bootcamps/:bootcampId/courses
 * @access    Private
 */
exports.addCourse = asyncHandler(async (req, res, next) => {
  console.log(req.params);
  //  Add bootcamp this course pertains to
  req.body.bootcamp = req.params.bootcampId;
  //  Add user that added this course, too.
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));
  }

  if ((!bootcamp.user || bootcamp.user.toString() !== req.user.id) && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a course to bootcamp ${req.params.bootcampId}`,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({ success: true, data: { course } });
});

/**
 *
 * @desc    Get all courses
 * @route   GET /api/v1/courses
 * @route   GET /api/v1/bootcamps/:bootcampId/courses
 * @access  Public
 */
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
  // let query;

  // console.log(req);

  // if (req.params.bootcampId) {
  //   console.log(req.params.bootcampId);
  //   // omit await here.. but populate query with mongoose.Query to use its functionality
  //   query = Course.find({ bootcamp: req.params.bootcampId });
  // } else {
  //   // Only return the name & description field with the courses
  //   query = Course.find().populate({
  //     path: 'bootcamp',
  //     select: 'name description',
  //   });
  // }

  // const courses = await query;

  // if (!courses) {
  //   return next(new ErrorResponse(`Courses not found`, 404));
  // }

  // res.status(200).json({
  //   success: true,
  //   count: courses.length,
  //   data: courses,
  // });
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

/**
 * @todo The access here is declared as private in the comments, but I have yet to
 * set up the logic for that. Soon enough, I will make it so that only the admin can change
 * these resources.
 * @desc    Update one course
 * @route   PUT /api/v1/course/:id
 * @access  Private
 */
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`No course with the id of ${req.params.id} `, 404));
  }

  if ((!course.user || course.user.toString() !== req.user.id) && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this course`, 401));
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    // Run the mongoose validator when someone PUTs
    runValidators: true,
  });

  res.status(200).json({ success: true, msg: `Update course id ${req.params.id}`, data: course });
});

/**
 * @desc    Delete one course
 * @route   DELETE /api/v1/course/:id
 * @access  Private
 */
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`No course with the id of ${req.params.id} `, 404));
  }

  if ((!course.user || course.user.toString() !== req.user.id) && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this course`, 401));
  }

  course = await Course.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, msg: `Update course id ${req.params.id}`, data: {} });
});
