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

  const revExists = await Review.findOne({ bootcamp: req.body.bootcamp, user: req.body.user });

  if (revExists) {
    return next(new ErrorResponse(`Post already exists from you for bootcamp id of ${req.params.bootcampId}`, 404));
  }

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404));
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
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
exports.updateReview = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`No review with the id of ${req.params.id}`, 404));
  }
  console.log(review.user.toString());
  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: review,
  });
});

/**
 * @desc    Delete one course
 * @route   DELETE /api/v1/course/:id
 * @access  Private
 */
exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`No review with the id of ${req.params.id} `, 404));
  }

  if (clientOwnsDocument(req, review)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this course`, 401));
  }
  // if ((!review.user || review.user.toString() !== req.user.id) && req.user.role !== 'admin') {
  //   return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this course`, 401));
  // }

  review = await Review.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, msg: `Deleted review id ${req.params.id}`, data: {} });
});

function clientOwnsDocument(clientReq, review) {
  return (!review.user || review.user.toString() !== clientReq.user.id) && clientReq.user.role !== 'admin';
}
