const express = require('express');
const { getCourse, getCourses, addCourse } = require('../controllers/courses');
const router = express.Router({
  // Makes the params sent to the original endpoint available :-)
  mergeParams: true,
});
// Register the getBootcampsInRadius controller
// Imagine the route ends with /api/v1/bootcamps then begins the /radius/:zipcode/:distance
router.route('/').get(getCourses).post(addCourse);
router.route('/:id').get(getCourse);

module.exports = router;
