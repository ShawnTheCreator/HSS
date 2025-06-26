const nodemailer = require("nodemailer");
// require("dotenv").config();

function send2FAMessage(toEmail, code) {
  // Enter the sender/admin email address
  const sender = "your-email@gmail.com";
  // go to https://myaccount.google.com/apppasswords create an app name it whatever and then get the 16 digit password
  const password = "16-digit-password";

  // Sets the subject line of the email
  const subject = "Your 2FA Code";
  // Sets the contents of the email
  const message = `<html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width:600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <tr>
            <td align="center" style="padding-bottom: 10px;">
              <img src="https://content.presspage.com/uploads/2373/1920_hss-flat-lightblue-logo-01-201130.png?10000" alt="Banner" width="100%" style="border-radius: 8px 8px 0 0;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align:center;">
              <h2 style="color: #333;">Your Two-Factor Authentication (2FA) Code</h2>
              <p style="font-size: 18px;">Your code is:</p>
              <p style="font-size: 32px; font-weight: bold; color: #007BFF;">${code}</p>
              <p style="color: #555;">If you did not request this, please secure your account.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: sender,
      pass: password,
    },
  });

  const mailOptions = {
    from: sender,
    to: toEmail,
    subject: subject,
    text: "",
    html: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending 2FA email:", error);
    } else {
      console.log("2FA email sent:", info.response);
    }
  });
}

// This bit actually runs the code
const testEmail = "recepient-gmail.com"; // Enter the email of the user that needs the 2FA
const code = Math.floor(100000 + Math.random() * 900000); // generates 6-digit random code
send2FAMessage(testEmail, code.toString()); // sends the 2FA pin
