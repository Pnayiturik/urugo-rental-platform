const nodemailer = require('nodemailer');

let transporter;

const initializeTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  console.log('📧 Email service initialized (Test mode)');
};

const sendTenantInvitation = async ({ tenantEmail, tenantName, landlordName, propertyName, unitNumber, rent, tempPassword, loginUrl }) => {
  if (!transporter) {
    await initializeTransporter();
  }

  const mailOptions = {
    from: '"Urugo Rental Platform" <noreply@urugo.com>',
    to: tenantEmail,
    subject: `Welcome to ${propertyName} - Your Rental Account`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #7B2CBF 0%, #5A189A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7B2CBF; }
          .credentials { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #7B2CBF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Welcome to Urugo</h1>
          </div>
          <div class="content">
            <h2>Hello ${tenantName}!</h2>
            <p>${landlordName} has assigned you to a unit at <strong>${propertyName}</strong>.</p>
            
            <div class="details">
              <h3>Your Rental Details:</h3>
              <p><strong>Property:</strong> ${propertyName}</p>
              <p><strong>Unit Number:</strong> ${unitNumber}</p>
              <p><strong>Monthly Rent:</strong> $${rent}</p>
            </div>

            <div class="credentials">
              <h3>⚠️ Your Login Credentials:</h3>
              <p><strong>Email:</strong> ${tenantEmail}</p>
              <p><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
              <p style="font-size: 14px; color: #666;">⚠️ You will be asked to change your password on first login.</p>
            </div>

            <p>Click the button below to access your tenant portal:</p>
            <a href="${loginUrl}" class="button">Login to Your Account</a>

            <p style="margin-top: 30px;">If you have any questions, please contact your landlord.</p>
          </div>
          <div class="footer">
            <p>This is an automated email from Urugo Rental Platform</p>
            <p>Please do not reply to this email</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  
  console.log('📧 Email sent:', info.messageId);
  console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
  
  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info)
  };
};

module.exports = { initializeTransporter, sendTenantInvitation };