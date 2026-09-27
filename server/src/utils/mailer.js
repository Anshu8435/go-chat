import nodemailer from "nodemailer";

const getTransporter = () => {
  const user =
    process.env.GMAIL_USER ||
    process.env.EMAIL_USER ||
    process.env.GMAIL_USERNAME ||
    "anshugupta15029@gmail.com";

  const pass =
    process.env.GMAIL_PASSCODE ||
    process.env.EMAIL_PASS ||
    process.env.GMAIL_PASS ||
    "aaezvcoryxbqfeic";

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user.trim(),
      pass: pass.trim(),
    },
  });
};

/**
 * Send OTP for Login or Password Reset
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.otp
 * @param {'login'|'forgot-password'} params.type
 */
export const sendOtpEmail = async ({ email, otp, type = "login" }) => {
  const transporter = getTransporter();

  const isLogin = type === "login";
  const subject = isLogin
    ? `🔐 ${otp} is your GoChat Login OTP`
    : `🔑 ${otp} is your GoChat Password Reset OTP`;

  const title = isLogin ? "Login Verification Code" : "Reset Your Password";
  const description = isLogin
    ? "Use the following 6-digit One-Time Password (OTP) to securely log in to your GoChat account."
    : "We received a request to reset your GoChat account password. Use the OTP below to complete the reset.";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 40px auto; background-color: #0f172a; border-radius: 24px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center; background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15)); border-bottom: 1px solid #1e293b;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                <span style="color: #10b981;">Go</span>Chat
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #38bdf8; font-weight: 500;">
                Next-Gen Secure Messaging
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #f1f5f9;">
                ${title}
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 24px; color: #94a3b8;">
                Hello, <br />
                ${description}
              </p>

              <!-- OTP Badge -->
              <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border: 2px dashed #10b981; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #10b981; margin-bottom: 8px;">
                  Your Verification Code
                </span>
                <span style="display: inline-block; font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #ffffff; text-shadow: 0 2px 10px rgba(16,185,129,0.4);">
                  ${otp}
                </span>
                <span style="display: block; font-size: 12px; color: #64748b; margin-top: 8px;">
                  ⏳ This OTP is valid for 10 minutes.
                </span>
              </div>

              <div style="background-color: #1e293b; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; line-height: 20px; color: #cbd5e1;">
                  ⚠️ <strong>Security Notice:</strong> Never share this code with anyone. GoChat representatives will never ask for your code.
                </p>
              </div>

              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 18px;">
                If you did not request this OTP, you can safely ignore this email. Someone may have entered your email address by mistake.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; background-color: #0b1120; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} GoChat App. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const senderEmail =
    process.env.GMAIL_USER ||
    process.env.EMAIL_USER ||
    "anshugupta15029@gmail.com";

  return transporter.sendMail({
    from: `"GoChat Security" <${senderEmail.trim()}>`,
    to: email.trim(),
    subject,
    html,
  });
};

