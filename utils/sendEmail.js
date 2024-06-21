const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'btech20project24@gmail.com',
        pass: 'okrc aiwc rjfu eyhk',
    },
});

const sendEmail = async (mailOptions) => {
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
