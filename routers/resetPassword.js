const express = require('express');
const router = express.Router();
const { resetPassword } = require('../controllers/authController');
const { verifyOtp, refreshOtp } = require('../controllers/otpController');

router.route('/get-otp').post(refreshOtp);
router.route('/verify-otp').post(verifyOtp);
router.route('/').post(resetPassword);

module.exports = router;