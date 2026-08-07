const db = require("../config/db");
const nodemailer = require("nodemailer");

const sendMail = require("./mail");
const cron = require("node-cron");
const {
  checkLateStatus,
  updateStatus,
  calculateFine,
  checkLateRecords,
} = require("../model/libraryModel");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log("Cronn is running...");
cron.schedule("20 17 * * *", async () => {
  try {
    console.log("Sending reminder emails...");

    const lateRecords = await checkLateRecords();

    if (lateRecords.length === 0) {
      console.log("No overdue records.");
      return;
    }

    for (const record of lateRecords) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: record.EmailID,
        subject: "Book Return Reminder",
        html: `
          <h3>Hello ${record.userName},UserId${record.userId,record.records_id},</h3>
          <p>Your borrowed book is overdue.</p>
          <p>Please return it as soon as possible.</p>
        `,
      });
    }

    console.log("Reminder emails sent.");
  } catch (error) {
    console.error("Cron Job 2 Error:", error);
  }
});

cron.schedule("17 17 * * *", async () => {
  try {
    console.log("Running fine calculation...");

    await calculateFine();

    const users = await checkLateStatus();

    for (const user of users) {
      await updateStatus(user.userId, "Defaulter");
    }
    const lateRecords = await checkLateRecords();

    for (const record of lateRecords) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: record.EmailID,
        subject: "Book Return Reminder",
        html: `
          <h3>Hello ${record.userName},UserId${record.userId,record.records_id}</h3>
          <p>Your borrowed book is overdue.</p>
          <p>hi</p>
        `,
      });
    }
    console.log("Fine calculation and status update completed.");
  } catch (error) {
    console.error("Cron Job 1 Error:", error);
  }
});
