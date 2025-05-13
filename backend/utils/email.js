const nodemailer = require('nodemailer');

// ===============================
// Email Transport Configuration
// ===============================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Admin Email
    pass: process.env.EMAIL_PASS  // Google App Password
  }
});

// ===============================
// Function to Send Email
// ===============================
const sendEmail = async ({ email, subject, message }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: message
    });
    console.log(`✅ Email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending email: ", error);
    throw new Error("Email could not be sent");
  }
};

// Export the function
module.exports = sendEmail;
