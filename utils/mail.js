const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMail(from, to, subject, body) {
  try {
    // console.log(`Found ${lateRecords.length} overdue records.`);
    for (const record of lateRecords) {
      await transporter.sendMail({
        from: from,
        to: to,
        subject: subject,
        html: body,
      });
    }

    console.log("Email sent.");
  } catch (error) {
    console.error(error);
  }
}

// sendMail();

module.exports = sendMail;
