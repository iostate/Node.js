const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const Review = require('../models/Review');

/**
 *
 * @desc    Get reviews
 * @route   GET /api/v1/reviews
 * @route   GET /api/v1/bootcamps/:bootcampId/reviews
 * @access  Public
 */
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

/**
 *
 * @desc    Get single review
 * @route   GET /api/v1/reviews/:id
 * @access  Public
 */
exports.getReview = asyncHandler(async (req, res, next) => {
  //  Check request for an id

  const review = await Review.findById({ bootcamp: req.params.id }).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!review) {
    return next(new ErrorResponse(`Review of id ${req.params.id} not found`, 404));
  }

  return res.status(200).json({
    success: true,
    data: review,
  });
});

/**
 *
 * @desc      Add a review for a bootcamp
 * @route     POST /api/v1/bootcamps/:bootcampId/reviews
 * @access    Public/User
 */
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const reviewExists = await Review.find({ bootcamp: req.body.bootcamp, user: req.body.user });

  if (reviewExists) {
    return next(new ErrorResponse(`Post already submitted `, 404));
  }

  console.log(req.body);
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404));
  }

  const review = await Review.create(req.body);

  res.status(201).json({ success: true, data: review });
});
