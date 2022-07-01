const express = require('express');
const { register, getUsers, login, updateUser } = require('../controllers/auth');
const router = express.Router();
const User = require('../models/User');
const advancedResults = require('../middleware/advancedResults');
const { protect, getMe, authorize } = require('../middleware/auth');

router.post('/register', register);
router.route('/login').post(protect, login);
router.route('/me').post(protect, getMe);
router
  .route('/users')
  .get(protect, advancedResults(User), getUsers)
  .put(protect, authorize('publisher', 'admin'), updateUser);
module.exports = router;
