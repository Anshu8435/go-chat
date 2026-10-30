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

export const sendOtpEmail = async ({ email, otp, type = "login" }) => {
  const transporter = getTransporter();
  const isLogin = type === "login";

  const subject = isLogin
    ? `${otp} is your GoChat verification code`
    : `${otp} is your GoChat password reset code`;

  const title = isLogin ? "Verification Code" : "Password Reset";
  const description = isLogin
    ? "Use the verification code below to complete your login."
    : "Use the verification code below to reset your password.";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 40px auto; background-color: #0f172a; border-radius: 20px; border: 1px solid #1e293b; overflow: hidden;">
          <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 1px solid #1e293b;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #ffffff;">
                <span style="color: #10b981;">Go</span>Chat
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #f1f5f9;">
                ${title}
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #94a3b8;">
                ${description}
              </p>
              <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #10b981;">
                  ${otp}
                </span>
                <span style="display: block; font-size: 12px; color: #64748b; margin-top: 6px;">
                  This code expires in 10 minutes.
                </span>
              </div>
              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 18px;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px; background-color: #0b1120; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} GoChat. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const senderEmail =
    process.env.GMAIL_USER || process.env.EMAIL_USER || "anshugupta15029@gmail.com";

  return transporter.sendMail({
    from: `"GoChat" <${senderEmail.trim()}>`,
    to: email.trim(),
    subject,
    html,
  });
};
