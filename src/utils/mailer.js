const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  logger: true,
  debug: true,
});

const sendOrderStatusEmail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: `"Bandai Shop" <${process.env.GMAIL_USER}>`, // ✅ đúng sender
      to,
      subject,
      html: htmlContent,
    });
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Không thể gửi email");
  }
};

module.exports = { sendOrderStatusEmail };
