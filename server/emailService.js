const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVerificationEmail(toEmail, code) {
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #2DD4BF, #0D9488); color: #fff; font-size: 24px; font-weight: 800; line-height: 48px;">M</div>
        <h1 style="font-size: 22px; font-weight: 800; margin: 12px 0 4px;">MediStore</h1>
        <p style="font-size: 14px; color: #64748b; margin: 0;">Verify your email address</p>
      </div>
      <div style="background: #fff; border-radius: 12px; padding: 28px; text-align: center; border: 1px solid #e2e8f0;">
        <p style="font-size: 15px; color: #334155; margin: 0 0 20px;">Enter this code to complete your registration:</p>
        <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0D9488; background: #F0FDFA; padding: 16px 24px; border-radius: 12px; display: inline-block; border: 2px dashed #99F6E4;">
          ${code}
        </div>
        <p style="font-size: 13px; color: #94a3b8; margin: 20px 0 0;">This code expires in <strong>10 minutes</strong></p>
      </div>
      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px;">
        If you didn't create an account on MediStore, you can safely ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"MediStore" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Verify your MediStore account",
    html,
  });
}

module.exports = { sendVerificationEmail };
