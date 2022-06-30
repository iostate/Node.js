const express = require('express');
const { getCourse, getCourses, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');
const { protect, authorize } = require('../middleware/auth');
const Course = require('../models/Course');
const router = express.Router({
  // Makes the params sent to the original endpoint available :-)
  mergeParams: true,
});

const advancedResults = require('../middleware/advancedResults');

// Register the getBootcampsInRadius controller
// Imagine the route ends with /api/v1/bootcamps then begins the /radius/:zipcode/:distance
router
  .route('/')
  .get(
    advancedResults(Course, {
      path: 'bootcamp',
      select: 'name description',
      strictPopulate: false,
    }),
    getCourses
  )
  .post(protect, authorize('publisher', 'admin'), addCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse);
module.exports = router;
