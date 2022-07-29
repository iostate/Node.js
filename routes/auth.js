const express = require('express');
const { register, login, logout, forgotPassword, getMe, updateDetails, updatePassword, resetPassword } = require('../controllers/auth');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.route('/me').post(protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.route('/resetpassword/:resetToken').put(resetPassword);
// router.route('/users').get(protect, authorize('admin'), advancedResults(User), getUsers);
// .push(protect, updateUser);
// .put(protect, authorize('publisher', 'admin'), updateUser);
module.exports = router;
