// utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Support" <${process.env.MAIL_USERNAME}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
