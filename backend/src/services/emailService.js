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
const sendPaymentReminder = async ({ tenantEmail, tenantName, amount, dueDate, propertyName, daysUntilDue }) => {
  if (!transporter) {
    await initializeTransporter();
  }

  const subject = daysUntilDue === 0 
    ? '⚠️ Rent Payment Due Today' 
    : daysUntilDue < 0 
    ? '🚨 URGENT: Overdue Rent Payment' 
    : `📅 Rent Payment Reminder - Due in ${daysUntilDue} days`;

  const urgencyColor = daysUntilDue < 0 ? '#DC2626' : daysUntilDue === 0 ? '#F59E0B' : '#7B2CBF';

  const mailOptions = {
    from: '"Urugo Rental Platform" <noreply@urugo.com>',
    to: tenantEmail,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${urgencyColor}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: ${daysUntilDue < 0 ? '#FEF2F2' : '#FEF3C7'}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgencyColor}; }
          .amount { font-size: 36px; font-weight: bold; color: ${urgencyColor}; margin: 20px 0; }
          .button { display: inline-block; background: ${urgencyColor}; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${daysUntilDue < 0 ? '🚨 OVERDUE PAYMENT' : daysUntilDue === 0 ? '⚠️ PAYMENT DUE TODAY' : '📅 Payment Reminder'}</h1>
          </div>
          <div class="content">
            <h2>Hello ${tenantName},</h2>
            ${daysUntilDue < 0 
              ? `<p style="color: #DC2626; font-weight: bold;">Your rent payment is now ${Math.abs(daysUntilDue)} day(s) overdue. Please pay immediately to avoid additional penalties.</p>`
              : daysUntilDue === 0
              ? `<p style="color: #F59E0B; font-weight: bold;">Your rent payment is due today!</p>`
              : `<p>This is a friendly reminder that your rent payment is due in ${daysUntilDue} days.</p>`
            }
            
            <div class="alert-box">
              <p><strong>Property:</strong> ${propertyName}</p>
              <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <div class="amount">$${amount}</div>
              ${daysUntilDue < 0 ? `<p style="color: #DC2626;"><strong>⚠️ A 5% late payment penalty may apply</strong></p>` : ''}
            </div>

            <p>Please log in to your tenant portal to make a payment:</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">Pay Now</a>

            <p style="margin-top: 30px;">If you have any questions, please contact your landlord.</p>
          </div>
          <div class="footer">
            <p>This is an automated reminder from Urugo Rental Platform</p>
            <p>Please do not reply to this email</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('📧 Payment reminder sent:', info.messageId);
  console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
  
  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info)
  };
};

const sendLandlordNotification = async ({ landlordEmail, landlordName, tenantName, amount, propertyName, type }) => {
  if (!transporter) {
    await initializeTransporter();
  }

  const subjects = {
    payment_received: '✅ Payment Received',
    payment_overdue: '⚠️ Overdue Payment Alert'
  };

  const mailOptions = {
    from: '"Urugo Rental Platform" <noreply@urugo.com>',
    to: landlordEmail,
    subject: subjects[type] || 'Urugo Notification',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${type === 'payment_received' ? '#10B981' : '#F59E0B'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${type === 'payment_received' ? '✅ Payment Received' : '⚠️ Payment Overdue'}</h1>
          </div>
          <div class="content">
            <h2>Hello ${landlordName},</h2>
            ${type === 'payment_received' 
              ? `<p>Great news! You have received a payment from your tenant.</p>`
              : `<p>A rent payment has become overdue.</p>`
            }
            
            <div class="info-box">
              <p><strong>Tenant:</strong> ${tenantName}</p>
              <p><strong>Property:</strong> ${propertyName}</p>
              <p><strong>Amount:</strong> $${amount}</p>
              ${type === 'payment_received' 
                ? `<p style="color: #10B981;"><strong>Status:</strong> Paid ✅</p>`
                : `<p style="color: #F59E0B;"><strong>Status:</strong> Overdue ⚠️</p>`
              }
            </div>

            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/landlord/transactions" style="color: #7B2CBF;">View in Dashboard →</a></p>
          </div>
          <div class="footer">
            <p>Urugo Rental Platform - Automated Notification</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('📧 Landlord notification sent:', info.messageId);
  
  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info)
  };
};

module.exports = { 
  initializeTransporter, 
  sendTenantInvitation,
  sendPaymentReminder,
  sendLandlordNotification
};