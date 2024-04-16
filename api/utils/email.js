import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text,html}) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
      user: "mediplusv2@outlook.com",
      pass: "MediPlus890@",
    },
  });

  const mailOptions = {
    from: "mediplusv2@outlook.com",
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error occurred:", error.message);
  }
};
