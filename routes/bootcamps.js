const express = require('express');

const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const courseRouter = require('../routes/courses');
const reviewRouter = require('../routes/reviews');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers.
// Instead of bringing in getCourses, we'll re-route
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/:id/photo').post(protect, bootcampPhotoUpload);
// router.route('/').get(getBootcamps).post(createBootcamp);
router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect, createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, updateBootcamp)
  .delete(protect, authorize('admin', 'publisher'), deleteBootcamp);
module.exports = router;
