const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) Create a transporter
  const transport = nodemailer.createTransport({
    service: 'outlook',
    auth: {
      user: process.env.EMAIL_OUTLOOK,
      pass: process.env.PASSWORD_OUTLOOK
    }
  });
  // 2) Define the emai, options
  const mailOptions = {
    from: process.env.EMAIL_OUTLOOK,
    to: process.env.EMAIL_OUTLOOK, //options.email
    subject: options.subject,
    text: options.message
    // html:
  };

  // 3) Actually send the email
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
