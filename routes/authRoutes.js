const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/verify-otp', authController.verifyOtp);
router.post('/send-otp', authController.forgotPassword);
router.put('/reset-password/:email', authController.resetPassword);

module.exports = router;
