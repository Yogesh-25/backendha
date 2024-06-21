const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const Admin = require('../models/Admin');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'btech20project24@gmail.com',
        pass: 'okrc aiwc rjfu eyhk',
    }
});

router.post('/admin/login', async (req, res) => {
    const { email } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid email address' });
        }
        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });
        // Send the OTP via email
        transporter.sendMail({
            from: admin,
            to: email,
            subject: 'Login OTP',
            text: `Your OTP for login is: ${otp}`
        }, async(error, info) => {
            if (error) {
                res.status(500).json({ success: false, message: 'Failed to send OTP email' });
            }
            //     else {
            //         admin.resetPasswordOTP = otp;
            //         console.log(otp);
            //         admin.save();
            //         res.json({ success: true, message: 'OTP sent to email', otp });
            //     }
            // });
            try {
                admin.resetPasswordOTP = otp;
                console.log(otp);
                await admin.save(); 
                res.json({ success: true, message: 'OTP sent to email', otp });
            } catch (saveError) {
                console.error('Error saving OTP:', saveError);
                res.status(500).json({ success: true, message: 'OTP sent to email but failed to save OTP', otp });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
// Route for handling OTP verification
router.post('/admin/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log('User not found:', email);
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        if (admin.resetPasswordOTP === otp) {
            admin.resetPasswordOTP = undefined;
            await admin.save();

            res.json({ success: true, message: 'OTP verified successfully' });
        } else {
            console.log('Invalid OTP or OTP expired:', email);
            res.status(401).json({ success: false, message: 'Invalid OTP or OTP expired' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
module.exports = router;