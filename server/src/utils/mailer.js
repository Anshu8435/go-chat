import nodemailer from "nodemailer";

const getCredentials = () => {
  const user =
    process.env.GMAIL_USER ||
    process.env.EMAIL_USER ||
    process.env.EMAIL_USERNAME ||
    process.env.GMAIL_USERNAME ||
    process.env.MAIL_USER ||
    process.env.SMTP_USER ||
    "anshugupta15029@gmail.com";

  const rawPass =
    process.env.GMAIL_PASSCODE ||
    process.env.EMAIL_PASS ||
    process.env.GMAIL_PASS ||
    process.env.EMAIL_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.APP_PASSWORD ||
    process.env.SMTP_PASS ||
    process.env.MAIL_PASS ||
    "aaezvcoryxbqfeic";

  // Google displays App Passwords in groups of 4 separated by spaces; remove all whitespace
  const pass = String(rawPass).replace(/\s+/g, "").trim();

  return {
    user: user.trim(),
    pass,
  };
};

export const sendOtpEmail = async ({ email, otp, type = "login" }) => {
  const { user, pass } = getCredentials();
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

  const mailOptions = {
    from: `"GoChat" <${user}>`,
    to: email.trim(),
    subject,
    html,
  };

  // Strategy 1: Direct SSL on port 465 (safest and most reliable on cloud platforms like Render)
  try {
    const transporter465 = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 12000,
      greetingTimeout: 12000,
      socketTimeout: 15000,
    });
    return await transporter465.sendMail(mailOptions);
  } catch (err465) {
    console.warn("Direct port 465 SSL failed, trying service: 'gmail'...", err465.message);

    // Strategy 2: service: "gmail"
    try {
      const transporterService = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 12000,
        greetingTimeout: 12000,
        socketTimeout: 15000,
      });
      return await transporterService.sendMail(mailOptions);
    } catch (errService) {
      console.warn("Service 'gmail' failed, trying port 587 STARTTLS...", errService.message);

      // Strategy 3: Port 587 STARTTLS
      const transporter587 = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 12000,
        greetingTimeout: 12000,
        socketTimeout: 15000,
      });
      return await transporter587.sendMail(mailOptions);
    }
  }
};
