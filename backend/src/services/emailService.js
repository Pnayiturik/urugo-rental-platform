const nodemailer = require('nodemailer');

let transporter;

const initializeTransporter = async () => {
  // For production, use your Gmail/SMTP settings from .env
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log('📧 Email service initialized');
};

const sendTenantInvitation = async ({ tenantEmail, tenantName, landlordName, propertyName, unitNumber, rent, tempPassword, loginUrl }) => {
  if (!transporter) await initializeTransporter();

  const brandColor = '#54ab91';

  const mailOptions = {
    from: `"Urugo Rental Platform" <${process.env.EMAIL_USER}>`,
    to: tenantEmail,
    subject: `🏠 Invitation to join Urugo - ${propertyName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background-color: ${brandColor}; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Urugo</h1>
        </div>
        <div style="padding: 32px; background-color: white;">
          <h2 style="color: #1e293b; margin-top: 0;">Hello ${tenantName},</h2>
          <p style="color: #64748b; line-height: 1.6;">${landlordName} has invited you to manage your new rental digitally. This ensures transparency and a verifiable rental history for you.</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid ${brandColor}; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-weight: bold; color: #1e293b;">Property: ${propertyName}</p>
            <p style="margin: 4px 0; color: #64748b;">Unit: ${unitNumber} | Rent: ${rent} RWF</p>
          </div>

          <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Temporary Password:</strong> ${tempPassword}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #b45309;">Please change this immediately after your first login.</p>
          </div>

          <a href="${loginUrl}" style="display: block; background-color: ${brandColor}; color: white; text-align: center; padding: 16px; border-radius: 12px; text-decoration: none; font-weight: bold;">Login to Your Dashboard</a>
        </div>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          © 2026 Urugo Rental Platform • Kigali, Rwanda
        </div>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = { initializeTransporter, sendTenantInvitation };