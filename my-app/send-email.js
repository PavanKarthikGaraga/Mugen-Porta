const nodemailer = require('nodemailer');

const password = process.argv[2] ? process.argv[2].trim() : '';

if (!password) {
  console.error("Please provide the ZeptoMail password as an argument.");
  console.error("Usage: node send-email.js <password>");
  process.exit(1);
}

console.log("Password starts with:", password.substring(0, 10));
console.log("Password length:", password.length);

const transporter = nodemailer.createTransport({
  host: 'smtp.zeptomail.in',
  port: 465,
  secure: true, // Use SSL/TLS
  auth: {
    user: 'emailapikey',
    pass: password,
  },
});

const mailOptions = {
  from: 'noreply@zeroonedevs.in', // Make sure this is a verified sender address in your ZeptoMail account
  to: 'singananischal@gmail.com',
  subject: 'TEST EMAIL OF SAMAM',
  text: 'This is a test email for SAMAM.',
};

console.log("Sending email...");

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.error("Error sending email:", error);
  }
  console.log('Email sent successfully!');
  console.log('Message ID: %s', info.messageId);
});
