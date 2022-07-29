const express = require('express');
const router = express.Router({ mergeParams: true });
const User = require('../models/User');

const { getUser, getUsers, createUser, deleteUser, updateUser } = require('../controllers/users');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
// Must be an admin to use ANY of these routes to perform CRUD on Users
router.use(authorize('admin'));

router.route('/').get(advancedResults(User), getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);
module.exports = router;
