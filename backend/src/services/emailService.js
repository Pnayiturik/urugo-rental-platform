const nodemailer = require('nodemailer');
let transporter = null;



const initializeTransporter = async () => {
  if (transporter) return transporter;
  // Check for required config
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !(process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD)) {
    console.warn('[emailService] Email not configured. Skipping email features.');
    return null;
  }
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: String(process.env.EMAIL_SECURE || 'false') === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD
      }
    });
    await transporter.verify();
    return transporter;
  } catch (err) {
    console.warn('[emailService] Failed to initialize transporter:', err.message);
    return null;
  }
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const t = await initializeTransporter();
    if (!t) {
      console.warn('[emailService] Email not sent (not configured):', subject);
      return { skipped: true };
    }
    return await t.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text
    });
  } catch (err) {
    console.warn('[emailService] Email send failed, skipping:', err.message);
    return { error: err.message };
  }
};

const sendTenantInvitation = async ({
  tenantEmail,
  tenantName,
  landlordName,
  propertyName,
  unitNumber,
  rent,
  tempPassword,
  loginUrl
}) => {
  const subject = `Welcome to your new home at ${propertyName}!`;
  const html = `
    <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px;">
      <h2 style="font-size: 24px; font-weight: 900; color: #0f172a;">Welcome to Urugo</h2>
      <p style="font-size: 16px; color: #64748b;">
        Hello ${tenantName}, your landlord ${landlordName} has assigned you to <b>Unit ${unitNumber}</b> at <b>${propertyName}</b>.
      </p>
      <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0;">
        <p style="margin: 0; font-size: 12px; font-weight: 900; text-transform: uppercase; color: #94a3b8;">Login Credentials</p>
        <p style="margin: 12px 0 4px 0;"><strong>Email:</strong> ${tenantEmail}</p>
        <p style="margin: 0;"><strong>Temporary Password:</strong> <span style="color: #54ab91; font-weight: bold;">${tempPassword}</span></p>
      </div>
      <a href="${loginUrl}" style="display: inline-block; background-color: #54ab91; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold;">
        Access Your Dashboard
      </a>
      <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
        <b>Important:</b> You will be required to change this password on your first login for security.
      </p>
    </div>
  `;
  return sendEmail({ to: tenantEmail, subject, html });
};

module.exports = {
  initializeTransporter,
  sendEmail,
  sendTenantInvitation
};