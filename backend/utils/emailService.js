import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create transporter configuration based on email service
const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  
  let transportConfig;
  
  if (emailService === 'gmail') {
    // Gmail configuration
    transportConfig = {
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Additional Gmail-specific settings
      tls: {
        rejectUnauthorized: false, // For development, set to true in production
        ciphers: 'SSLv3'
      },
      pool: true, // Use connection pool
      maxConnections: 5,
      maxMessages: 10,
      rateDelta: 1000,
      rateLimit: 5
    };
  } else {
    // Custom SMTP configuration
    transportConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // For development
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 10
    };
  }

  console.log('📧 Email Configuration:', {
    service: emailService,
    user: process.env.EMAIL_USER,
    host: transportConfig.host,
    port: transportConfig.port,
    secure: transportConfig.secure
  });

  return nodemailer.createTransport(transportConfig);
};

// Create persistent transporter
const transporter = createTransporter();

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter verification failed:', error.message);
    console.error('Please check your email configuration in .env file');
    console.error('For Gmail, make sure you are using an App Password');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Email template for OTP
const getOTPEmailHTML = (otp, userName, portalType = 'general') => {
  const portalInfo = portalType === 'agent-portal' 
    ? {
        title: '🔐 Agent Portal Login Verification',
        greeting: `Hello <strong>${userName}</strong>,`,
        description: 'You are attempting to log in to the <strong>Agent Portal</strong>. Please use the following One-Time Password (OTP) to complete your login:',
        portalName: 'Agent Portal',
        note: 'This OTP is specifically for accessing the Agent Portal where you can manage bookings and services.'
      }
    : portalType === 'admin_portal'
    ? {
        title: '🔐 Admin Panel Login Verification',
        greeting: `Hello <strong>${userName}</strong>,`,
        description: 'You are attempting to log in to the <strong>Admin Panel</strong>. Please use the following One-Time Password (OTP) to complete your login:',
        portalName: 'Admin Panel',
        note: 'This OTP is specifically for accessing the Admin Panel where you can manage the system.'
      }
    : {
        title: '🔐 Login Verification',
        greeting: `Hello <strong>${userName}</strong>,`,
        description: 'We received a login request for your AZAN-E-MADINA account. Please use the following One-Time Password (OTP) to verify your identity and complete the login process:',
        portalName: 'AZAN-E-MADINA',
        note: 'This OTP is for verifying your identity during the login process.'
      };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login OTP - AZAN-E-MADINA</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #C9A536 0%, #E6C35C 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .otp-box { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 3px solid #C9A536; border-radius: 12px; padding: 30px; margin: 25px 0; text-align: center; }
        .otp-code { font-size: 42px; font-weight: bold; color: #C9A536; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 15px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .info { background-color: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; border-radius: 4px; color: #0c5460; }
        .portal-badge { display: inline-block; background-color: #C9A536; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${portalInfo.title}</h1>
        </div>
        <div class="content">
          <p>${portalInfo.greeting}</p>
          <p>${portalInfo.description}</p>
          ${portalType !== 'general' ? `<div class="portal-badge">${portalInfo.portalName}</div>` : ''}
          
          <div class="otp-box">
            <p style="margin: 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
          </div>

          <div class="info">
            <strong>ℹ️ How to use:</strong>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Copy the 6-digit code above</li>
              <li>Return to the ${portalInfo.portalName} login page</li>
              <li>Enter the code in the OTP field</li>
              <li>Click "Verify OTP" to complete login</li>
            </ol>
            <p style="margin: 10px 0 0 0; font-size: 13px;"><em>${portalInfo.note}</em></p>
          </div>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul style="margin: 10px 0;">
              <li>This OTP will expire in 10 minutes</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't attempt to login, please secure your account immediately</li>
              <li>Contact support if you notice any suspicious activity</li>
            </ul>
          </div>

          <p>If you have any questions or concerns, please contact our support team.</p>
          <p>Best regards,<br><strong>AZAN-E-MADINA Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AZAN-E-MADINA. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send OTP email
export const sendOTPEmail = async (email, otp, userName, portalType = 'general') => {
  try {

    const subjectMap = {
      'agent-portal': 'Agent Portal Login OTP - AZAN-E-MADINA',
      'admin_portal': 'Admin Panel Login OTP - AZAN-E-MADINA',
      'general': 'Login OTP - AZAN-E-MADINA'
    };

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || "AZAN-E-MADINA",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: subjectMap[portalType] || subjectMap['general'],
      html: getOTPEmailHTML(otp, userName, portalType),
      text: `Hello,\n\nYou are attempting to log in to ${portalType === 'agent-portal' ? 'Agent Portal' : portalType === 'admin_portal' ? 'Admin Panel' : 'your AZAN-E-MADINA account'}.\n\nYour OTP Code: ${otp}\n\nThis code will expire in 10 minutes.\n\nDo not share this code with anyone.\nIf you didn't attempt to login, please secure your account immediately.\n\nBest regards,\nAZAN-E-MADINA Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

// Email template for password reset
// Agent Password Reset Email Template
const getAgentPasswordResetEmailHTML = (resetLink, userName, companyName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Agent Portal</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #C9A536 0%, #E6C35C 100%);
          color: #ffffff;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .badge {
          background-color: rgba(255,255,255,0.2);
          padding: 5px 15px;
          border-radius: 20px;
          display: inline-block;
          margin-top: 10px;
          font-size: 12px;
        }
        .content {
          padding: 30px 20px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #C9A536;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 25px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #E6C35C;
        }
        .footer {
          background-color: #f8f8f8;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Agent Portal - Password Reset</h1>
          <div class="badge">AGENT PORTAL</div>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong> from <strong>${companyName}</strong>,</p>
          <p>We received a request to reset your Agent Portal password. Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Agent Portal Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #C9A536;">${resetLink}</p>
          <div class="warning">
            <strong>⚠️ Important Security Information:</strong>
            <ul style="margin: 10px 0;">
              <li>This link will expire in <strong>1 hour</strong></li>
              <li>This reset is specifically for your <strong>Agent Portal</strong> access</li>
              <li>If you didn't request this, please ignore this email and contact support immediately</li>
              <li>Your password won't change until you access the link above</li>
            </ul>
          </div>
          <p>If you have any questions or concerns, please contact our Agent Support Team.</p>
          <p>Best regards,<br><strong>AZAN-E-MADINA Agent Support Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AZAN-E-MADINA - Agent Portal. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Admin Password Reset Email Template
const getAdminPasswordResetEmailHTML = (resetLink, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Internal Portal</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);
          color: #ffffff;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .badge {
          background-color: rgba(255,255,255,0.2);
          padding: 5px 15px;
          border-radius: 20px;
          display: inline-block;
          margin-top: 10px;
          font-size: 12px;
        }
        .content {
          padding: 30px 20px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #1e3a8a;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 25px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #7c3aed;
        }
        .footer {
          background-color: #f8f8f8;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .warning {
          background-color: #dbeafe;
          border-left: 4px solid #1e3a8a;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Internal Portal - Password Reset</h1>
          <div class="badge">INTERNAL PORTAL</div>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          <p>We received a request to reset your Internal Portal password. Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Internal Portal Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #1e3a8a;">${resetLink}</p>
          <div class="warning">
            <strong>⚠️ Important Security Information:</strong>
            <ul style="margin: 10px 0;">
              <li>This link will expire in <strong>1 hour</strong></li>
              <li>This reset is specifically for your <strong>Internal Portal</strong> access</li>
              <li>If you didn't request this, please contact IT immediately</li>
              <li>Your password won't change until you access the link above</li>
              <li>This is a secure internal system - never share your credentials</li>
            </ul>
          </div>
          <p>If you have any questions or concerns, please contact the IT Department.</p>
          <p>Best regards,<br><strong>AZAN-E-MADINA IT Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AZAN-E-MADINA - Internal Portal. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Legacy Password Reset Email Template
const getPasswordResetEmailHTML = (resetLink, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #C9A536 0%, #E6C35C 100%);
          color: #ffffff;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px 20px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #C9A536;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 25px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #E6C35C;
        }
        .footer {
          background-color: #f8f8f8;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #C9A536;">${resetLink}</p>
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul style="margin: 10px 0;">
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Your password won't change until you access the link above</li>
            </ul>
          </div>
          <p>If you have any questions or concerns, please contact our support team.</p>
          <p>Best regards,<br><strong>AZAN-E-MADINA Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AZAN-E-MADINA. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send password reset email
// Agent Portal Password Reset Email
export const sendAgentPasswordResetEmail = async (email, resetToken, userId, userName, companyName) => {
  try {
    // Construct reset link - Agent portal URL
    const agentPortalURL = process.env.AGENT_PORTAL_URL || "https://agent.azan-e-madinah.com";
    const resetLink = `${agentPortalURL}/auth/forgot-password?token=${resetToken}&userId=${userId}`;

    const mailOptions = {
      from: {
        name: "AZAN-E-MADINA - Agent Portal",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Password Reset Request - Agent Portal",
      html: getAgentPasswordResetEmailHTML(resetLink, userName, companyName),
      text: `Hello ${userName},\n\nWe received a request to reset your Agent Portal password.\n\nPlease click the following link to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nAZAN-E-MADINA Agent Support Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending agent password reset email:", error.message);
    throw new Error(`Failed to send agent password reset email: ${error.message}`);
  }
};

// Admin Panel Password Reset Email
export const sendAdminPasswordResetEmail = async (email, resetToken, userId, userName) => {
  try {
    // Construct reset link - Admin panel URL
    const adminPanelURL = process.env.ADMIN_PANEL_URL || "https://admin.azan-e-madinah.com";
    const resetLink = `${adminPanelURL}/auth/forgot-password?token=${resetToken}&userId=${userId}`;

    const mailOptions = {
      from: {
        name: "AZAN-E-MADINA - Internal Portal",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Password Reset Request - Internal Portal",
      html: getAdminPasswordResetEmailHTML(resetLink, userName),
      text: `Hello ${userName},\n\nWe received a request to reset your Internal Portal password.\n\nPlease click the following link to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nAZAN-E-MADINA IT Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending admin password reset email:", error.message);
    throw new Error(`Failed to send admin password reset email: ${error.message}`);
  }
};

// Legacy function - kept for backward compatibility
export const sendPasswordResetEmail = async (email, resetToken, userId, userName) => {
  try {
    // Construct reset link
    const frontendURL = process.env.FRONTEND_URL || "https://azan-e-madinah.com";
    const resetLink = `${frontendURL}/auth/forgot-password?token=${resetToken}&userId=${userId}`;

    const mailOptions = {
      from: {
        name: "AZAN-E-MADINA",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Password Reset Request - AZAN-E-MADINA",
      html: getPasswordResetEmailHTML(resetLink, userName),
      text: `Hello ${userName},\n\nWe received a request to reset your password.\n\nPlease click the following link to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nAZAN-E-MADINA Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending password reset email:", error.message);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

// Email template for sending agent credentials
const getAgentCredentialsEmailHTML = (agentCode, email, password, userName, companyName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Agent Credentials</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #C9A536 0%, #E6C35C 100%);
          color: #ffffff;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px 20px;
        }
        .credentials-box {
          background-color: #f8f9fa;
          border: 2px solid #C9A536;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .credential-item {
          margin: 15px 0;
          padding: 10px;
          background-color: #ffffff;
          border-radius: 4px;
        }
        .credential-label {
          font-weight: bold;
          color: #C9A536;
          font-size: 14px;
        }
        .credential-value {
          font-size: 16px;
          color: #333;
          font-family: 'Courier New', monospace;
          margin-top: 5px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #C9A536;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 25px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #E6C35C;
        }
        .footer {
          background-color: #f8f8f8;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to AZAN-E-MADINA!</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Welcome to AZAN-E-MADINA! Your <strong>Agent Account</strong> has been created successfully.</p>
          <p><strong>Company:</strong> ${companyName}</p>
          
          <div class="credentials-box">
            <h3 style="margin-top: 0; color: #C9A536;">Your Agent Login Credentials</h3>
            
            <div class="credential-item">
              <div class="credential-label">Agent Code:</div>
              <div class="credential-value">${agentCode}</div>
            </div>
            
            <div class="credential-item">
              <div class="credential-label">Email:</div>
              <div class="credential-value">${email}</div>
            </div>
            
            <div class="credential-item">
              <div class="credential-label">Password:</div>
              <div class="credential-value">${password}</div>
            </div>
          </div>

          <div style="background-color: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0;">
            <strong>📍 Portal Access Information:</strong>
            <ul style="margin: 10px 0;">
              <li><strong>Agent Portal:</strong> Use the main website login</li>
              <li><strong>Login URL:</strong> ${process.env.FRONTEND_URL || 'https://azan-e-madinah.com'}/auth/login</li>
              <li><strong>Required:</strong> Agent Code, Email, and Password</li>
              <li><strong>Note:</strong> Agent accounts can only access the Agent Portal, not the Admin Panel</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://azan-e-madinah.com'}/auth/login" class="button">Login to Agent Portal</a>
          </div>

          <div class="warning">
            <strong>🔒 Security Tips:</strong>
            <ul style="margin: 10px 0;">
              <li>Keep your credentials safe and secure</li>
              <li>Never share your Agent Code or password with anyone</li>
              <li>We recommend changing your password after first login</li>
              <li>If you didn't request this account, please contact us immediately</li>
            </ul>
          </div>

          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br><strong>AZAN-E-MADINA Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AZAN-E-MADINA. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for admin/staff user credentials
const getAdminCredentialsEmailHTML = (email, password, userName, roles) => {
  const rolesList = roles && roles.length > 0 ? roles.join(', ') : 'User';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Account Credentials</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #C9A536 0%, #E6C35C 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .credentials-box { background-color: #f8f9fa; border: 2px solid #C9A536; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .credential-item { margin: 15px 0; padding: 10px; background-color: #ffffff; border-radius: 4px; }
        .credential-label { font-weight: bold; color: #C9A536; font-size: 14px; }
        .credential-value { font-size: 16px; color: #333; font-family: 'Courier New', monospace; margin-top: 5px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #C9A536; color: #ffffff !important; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
        .button:hover { background-color: #E6C35C; }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to AZAN-E-MADINA!</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Your <strong>Admin Account</strong> has been created successfully. You now have access to the AZAN-E-MADINA Admin Panel.</p>
          <p><strong>Assigned Role(s):</strong> ${rolesList}</p>
          
          <div class="credentials-box">
            <h3 style="margin-top: 0; color: #C9A536;">Your Admin Login Credentials</h3>
            
            <div class="credential-item">
              <div class="credential-label">Email:</div>
              <div class="credential-value">${email}</div>
            </div>
            
            <div class="credential-item">
              <div class="credential-label">Password:</div>
              <div class="credential-value">${password}</div>
            </div>
          </div>

          <div style="background-color: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0;">
            <strong>📍 Portal Access Information:</strong>
            <ul style="margin: 10px 0;">
              <li><strong>Admin Panel:</strong> Access the administrative dashboard</li>
              <li><strong>Login URL:</strong> ${process.env.ADMIN_URL || process.env.FRONTEND_URL || 'https://admin.azan-e-madinah.com'}/login</li>
              <li><strong>Required:</strong> Email and Password only (no Agent Code)</li>
              <li><strong>Note:</strong> Admin accounts cannot access the Agent Portal unless you also have an Agent role</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.ADMIN_URL || process.env.FRONTEND_URL || 'https://admin.azan-e-madinah.com'}/login" class="button">Login to Admin Panel</a>
          </div>

          <div class="warning">
            <strong>🔒 Security Tips:</strong>
            <ul style="margin: 10px 0;">
              <li>Keep your credentials safe and secure</li>
              <li>Never share your password with anyone</li>
              <li>We recommend changing your password after first login</li>
              <li>Report any suspicious activity immediately</li>
            </ul>
          </div>

          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br><strong>AZAN-E-MADINA Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AZAN-E-MADINA. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send credentials email to agent (with agency code)
export const sendAgentCredentialsEmail = async (email, agentCode, password, userName, companyName) => {
  try {
    console.log(`📤 Attempting to send agent credentials email to: ${email}`);
    console.log(`Agent: ${userName}, Code: ${agentCode}, Company: ${companyName}`);

    // Validate inputs
    if (!email || !agentCode || !password || !userName) {
      throw new Error('Missing required parameters: email, agentCode, password, or userName');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || "AZAN-E-MADINA",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Your Agent Credentials - AZAN-E-MADINA",
      html: getAgentCredentialsEmailHTML(agentCode, email, password, userName, companyName),
      text: `Hello ${userName},\n\nWelcome to AZAN-E-MADINA! Your agency account has been created successfully.\n\nCompany: ${companyName}\n\nYour Login Credentials:\nAgent Code: ${agentCode}\nEmail: ${email}\nPassword: ${password}\n\nLogin URL: ${process.env.FRONTEND_URL || 'https://azan-e-madinah.com'}/auth/login\n\nSecurity Tips:\n- Keep your credentials safe and secure\n- Do not share your password with anyone\n- We recommend changing your password after first login\n\nBest regards,\nAZAN-E-MADINA Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (info.rejected && info.rejected.length > 0) {
      throw new Error(`Email was rejected by the server for: ${info.rejected.join(', ')}`);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending agent credentials email:", error.message);
    throw new Error(`Failed to send agent credentials email: ${error.message}`);
  }
};

// Send credentials email to admin/staff user (without agency code)
export const sendAdminCredentialsEmail = async (email, password, userName, roles = []) => {
  try {
    console.log(`📤 Attempting to send admin credentials email to: ${email}`);
    

    // Validate inputs
    if (!email || !password || !userName) {
      throw new Error('Missing required parameters: email, password, or userName');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || "AZAN-E-MADINA",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Your Account Credentials - AZAN-E-MADINA",
      html: getAdminCredentialsEmailHTML(email, password, userName, roles),
      text: `Hello ${userName},\n\nYour account has been created successfully.\n\nRole(s): ${roles.join(', ')}\n\nYour Login Credentials:\nEmail: ${email}\nPassword: ${password}\n\nLogin URL: ${process.env.ADMIN_URL || process.env.FRONTEND_URL || 'https://admin.azan-e-madinah.com'}/login\n\nSecurity Tips:\n- Keep your credentials safe and secure\n- Do not share your password with anyone\n- We recommend changing your password after first login\n\nBest regards,\nAZAN-E-MADINA Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Admin credentials email sent successfully!");
    
    
    
    
    if (info.rejected && info.rejected.length > 0) {
      throw new Error(`Email was rejected by the server for: ${info.rejected.join(', ')}`);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending admin credentials email:", error.message);
    console.error("Error details:", {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    throw new Error(`Failed to send admin credentials email: ${error.message}`);
  }
};

// Universal credentials email function (auto-detects user type)
export const sendCredentialsEmail = async (email, password, userName, options = {}) => {
  const { agentCode, companyName, roles } = options;
  
  // If agentCode exists, send agent email
  if (agentCode) {
    return await sendAgentCredentialsEmail(
      email,
      agentCode,
      password,
      userName,
      companyName || 'N/A'
    );
  }
  
  // Otherwise, send admin/staff email
  return await sendAdminCredentialsEmail(
    email,
    password,
    userName,
    roles || []
  );
};

// Email template for agent approval
const getAgentApprovalEmailHTML = (userName, agencyCode, companyName, adminName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Agent Account Approved</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .success-box { background-color: #d4edda; border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; padding: 12px 30px; background-color: #28a745; color: #ffffff !important; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
        .button:hover { background-color: #218838; }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .info-item { margin: 10px 0; padding: 10px; background-color: #f8f9fa; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Your Agent Account is Activated!</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          <div class="success-box">
            <h2 style="color: #28a745; margin: 0;">✅ Account Approved</h2>
            <p style="margin: 10px 0;">Your agent account has been approved and activated!</p>
          </div>
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Agent Code:</strong> ${agencyCode}</p>
          <p><strong>Approved by:</strong> ${adminName}</p>
          <p>You can now login to your account and start using all agent features.</p>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://azan-e-madinah.com'}/auth/login" class="button">Login Now</a>
          </div>
          <p>If you have any questions or need assistance, please contact our support team.</p>
          <p>Best regards,<br><strong>AZAN-E-MADINA Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AZAN-E-MADINA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for agent rejection/suspension
const getAgentStatusChangeEmailHTML = (userName, agencyCode, companyName, newStatus, reason, adminName) => {
  const statusConfig = {
    Inactive: { color: '#ffc107', icon: '⚠️', title: 'Account Deactivated', message: 'Your agent account has been deactivated.' },
    Suspended: { color: '#dc3545', icon: '🚫', title: 'Account Suspended', message: 'Your agent account has been suspended.' },
    Pending: { color: '#6c757d', icon: '⏳', title: 'Account Pending', message: 'Your agent account is pending approval.' }
  };
  
  const config = statusConfig[newStatus] || statusConfig.Pending;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: ${config.color}; color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .status-box { background-color: #f8f9fa; border-left: 4px solid ${config.color}; padding: 20px; margin: 20px 0; }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${config.icon} ${config.title}</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          <div class="status-box">
            <p><strong>${config.message}</strong></p>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Agent Code:</strong> ${agencyCode}</p>
            <p><strong>New Status:</strong> ${newStatus}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p><strong>Updated by:</strong> ${adminName}</p>
          </div>
          <p>For more information or to appeal this decision, please contact our support team.</p>
          <p>Best regards,<br><strong>AZAN-E-MADINA Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AZAN-E-MADINA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for booking confirmation
const getBookingConfirmationEmailHTML = (booking, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #C9A536 0%, #E6C35C 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .booking-details { background-color: #f8f9fa; border: 2px solid #C9A536; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6; }
        .detail-label { font-weight: bold; color: #C9A536; }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .highlight { background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✈️ Booking Confirmation</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Your booking has been confirmed successfully!</p>
          <div class="booking-details">
            <h3 style="margin-top: 0; color: #C9A536;">Booking Details</h3>
            <div class="detail-row">
              <span class="detail-label">Booking Reference:</span>
              <span>${booking.bookingReference || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">PNR:</span>
              <span>${booking.pnr}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Airline:</span>
              <span>${booking.airline?.name || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Sector:</span>
              <span>${booking.sector}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Departure Date:</span>
              <span>${new Date(booking.departureDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Passengers:</span>
              <span>${booking.totalPassengers} (Adults: ${booking.adultsCount}, Children: ${booking.childrenCount}, Infants: ${booking.infantsCount})</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Amount:</span>
              <span><strong>PKR ${booking.pricing?.grandTotal?.toLocaleString()}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span><strong>${booking.status}</strong></span>
            </div>
          </div>
          <div class="highlight">
            <strong>📋 Important:</strong> Please keep this confirmation email for your records. Your booking reference number is <strong>${booking.bookingReference || booking.pnr}</strong>
          </div>
          <p>If you have any questions about your booking, please contact us.</p>
          <p>Best regards,<br><strong>AZAN-E-MADINA Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AZAN-E-MADINA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for booking status change
const getBookingStatusChangeEmailHTML = (booking, userName, oldStatus, newStatus) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #C9A536 0%, #E6C35C 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .status-box { background-color: #f8f9fa; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📢 Booking Status Update</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Your booking status has been updated.</p>
          <div class="status-box">
            <p><strong>Booking Reference:</strong> ${booking.bookingReference || booking.pnr}</p>
            <p><strong>PNR:</strong> ${booking.pnr}</p>
            <p><strong>Previous Status:</strong> ${oldStatus}</p>
            <p><strong>New Status:</strong> <strong>${newStatus}</strong></p>
            <p><strong>Airline:</strong> ${booking.airline?.name || 'N/A'}</p>
            <p><strong>Sector:</strong> ${booking.sector}</p>
          </div>
          <p>For more details, please login to your account.</p>
          <p>Best regards,<br><strong>AZAN-E-MADINA Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AZAN-E-MADINA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for payment confirmation
const getPaymentConfirmationEmailHTML = (payment, userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .payment-details { background-color: #d4edda; border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #c3e6cb; }
        .detail-label { font-weight: bold; color: #155724; }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Payment Confirmation</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Your payment has been received and processed successfully!</p>
          <div class="payment-details">
            <h3 style="margin-top: 0; color: #155724;">Payment Details</h3>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span>${new Date(payment.date).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount:</span>
              <span><strong>PKR ${payment.amount?.toLocaleString()}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Description:</span>
              <span>${payment.description}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Bank Account:</span>
              <span>${payment.bankAccount?.accountTitle || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span><strong>${payment.status}</strong></span>
            </div>
          </div>
          <p>Your account will be updated accordingly. You can view your transaction history in your account.</p>
          <p>Best regards,<br><strong>AZAN-E-MADINA Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AZAN-E-MADINA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for password change notification
const getPasswordChangeNotificationHTML = (userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Changed Successfully</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #C9A536 0%, #E6C35C 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .success-box { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Changed</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          <div class="success-box">
            <p><strong>✅ Your password has been changed successfully!</strong></p>
          </div>
          <p>Your account password was recently changed. If you made this change, no further action is needed.</p>
          <div class="warning">
            <strong>⚠️ Didn't make this change?</strong>
            <p>If you did not change your password, please contact our support team immediately to secure your account.</p>
          </div>
          <p>Best regards,<br><strong>AZAN-E-MADINA Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AZAN-E-MADINA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send agent approval email
export const sendAgentApprovalEmail = async (email, userName, agencyCode, companyName, adminName) => {
  try {
    console.log(`📤 Sending agent approval email to: ${email}`);
    
    const mailOptions = {
      from: {
        name: "AZAN-E-MADINA",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "🎉 Your Agent Account is Activated - AZAN-E-MADINA",
      html: getAgentApprovalEmailHTML(userName, agencyCode, companyName, adminName),
      text: `Hello ${userName},\n\nGreat news! Your agent account has been approved and activated!\n\nCompany: ${companyName}\nAgent Code: ${agencyCode}\nApproved by: ${adminName}\n\nYou can now login to your account and start using all agent features.\n\nLogin: ${process.env.FRONTEND_URL || 'https://azan-e-madinah.com'}/auth/login\n\nBest regards,\nAZAN-E-MADINA Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Agent approval email sent successfully!");
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending agent approval email:", error.message);
    throw new Error(`Failed to send agent approval email: ${error.message}`);
  }
};

// Send agent status change email
export const sendAgentStatusChangeEmail = async (email, userName, agencyCode, companyName, newStatus, reason, adminName) => {
  try {
    console.log(`📤 Sending agent status change email to: ${email} (Status: ${newStatus})`);
    
    const mailOptions = {
      from: {
        name: "AZAN-E-MADINA",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: `Account Status Update: ${newStatus} - AZAN-E-MADINA`,
      html: getAgentStatusChangeEmailHTML(userName, agencyCode, companyName, newStatus, reason, adminName),
      text: `Hello ${userName},\n\nYour agent account status has been updated.\n\nCompany: ${companyName}\nAgent Code: ${agencyCode}\nNew Status: ${newStatus}${reason ? `\nReason: ${reason}` : ''}\nUpdated by: ${adminName}\n\nFor more information, please contact our support team.\n\nBest regards,\nAZAN-E-MADINA Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Agent status change email sent successfully!");
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending agent status change email:", error.message);
    throw new Error(`Failed to send agent status change email: ${error.message}`);
  }
};

// Send booking confirmation email
export const sendBookingConfirmationEmail = async (email, userName, booking) => {
  try {
    console.log(`📤 Sending booking confirmation email to: ${email}`);
    
    const mailOptions = {
      from: {
        name: "AZAN-E-MADINA",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: `Booking Confirmation - ${booking.bookingReference || booking.pnr} - AZAN-E-MADINA`,
      html: getBookingConfirmationEmailHTML(booking, userName),
      text: `Hello ${userName},\n\nYour booking has been confirmed!\n\nBooking Reference: ${booking.bookingReference || booking.pnr}\nPNR: ${booking.pnr}\nAirline: ${booking.airline?.name || 'N/A'}\nSector: ${booking.sector}\nTotal Amount: PKR ${booking.pricing?.grandTotal?.toLocaleString()}\n\nBest regards,\nAZAN-E-MADINA Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Booking confirmation email sent successfully!");
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending booking confirmation email:", error.message);
    throw new Error(`Failed to send booking confirmation email: ${error.message}`);
  }
};

// Send booking status change email
export const sendBookingStatusChangeEmail = async (email, userName, booking, oldStatus, newStatus) => {
  try {
    console.log(`📤 Sending booking status change email to: ${email}`);
    
    const mailOptions = {
      from: {
        name: "AZAN-E-MADINA",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: `Booking Status Update - ${booking.bookingReference || booking.pnr} - AZAN-E-MADINA`,
      html: getBookingStatusChangeEmailHTML(booking, userName, oldStatus, newStatus),
      text: `Hello ${userName},\n\nYour booking status has been updated.\n\nBooking Reference: ${booking.bookingReference || booking.pnr}\nPrevious Status: ${oldStatus}\nNew Status: ${newStatus}\n\nBest regards,\nAZAN-E-MADINA Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Booking status change email sent successfully!");
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending booking status change email:", error.message);
    throw new Error(`Failed to send booking status change email: ${error.message}`);
  }
};

// Send payment confirmation email
export const sendPaymentConfirmationEmail = async (email, userName, payment) => {
  try {
    console.log(`📤 Sending payment confirmation email to: ${email}`);
    
    const mailOptions = {
      from: {
        name: "AZAN-E-MADINA",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: `Payment Confirmation - PKR ${payment.amount?.toLocaleString()} - AZAN-E-MADINA`,
      html: getPaymentConfirmationEmailHTML(payment, userName),
      text: `Hello ${userName},\n\nYour payment has been received and processed!\n\nAmount: PKR ${payment.amount?.toLocaleString()}\nDate: ${new Date(payment.date).toLocaleDateString()}\nDescription: ${payment.description}\nStatus: ${payment.status}\n\nBest regards,\nAZAN-E-MADINA Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Payment confirmation email sent successfully!");
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending payment confirmation email:", error.message);
    throw new Error(`Failed to send payment confirmation email: ${error.message}`);
  }
};

// Send password change notification email
export const sendPasswordChangeNotification = async (email, userName) => {
  try {
    console.log(`📤 Sending password change notification to: ${email}`);
    
    const mailOptions = {
      from: {
        name: "AZAN-E-MADINA",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Password Changed Successfully - AZAN-E-MADINA",
      html: getPasswordChangeNotificationHTML(userName),
      text: `Hello ${userName},\n\nYour password has been changed successfully!\n\nIf you didn't make this change, please contact our support team immediately.\n\nBest regards,\nAZAN-E-MADINA Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password change notification sent successfully!");
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending password change notification:", error.message);
    throw new Error(`Failed to send password change notification: ${error.message}`);
  }
};

// Send notification when Internal Staff roles are added to existing Agent
export const sendInternalStaffAccessNotification = async (email, userName, roleNames) => {
  try {
    const adminPanelUrl = process.env.ADMIN_PANEL_URL || 'http://localhost:5174';
    
    const getHTML = () => {
      const rolesHTML = roleNames.map(role => 
        `<li style="margin: 5px 0; color: #1a73e8; font-weight: 500;">✓ ${role}</li>`
      ).join('');
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin Panel Access Granted</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                        🎉 Admin Panel Access Granted!
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hello <strong>${userName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 25px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        Great news! You have been granted access to the <strong>Admin Panel</strong> with the following role(s):
                      </p>
                      
                      <!-- Roles Box -->
                      <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 8px;">
                        <ul style="margin: 0; padding-left: 20px; list-style: none;">
                          ${rolesHTML}
                        </ul>
                      </div>
                      
                      <!-- Important Notice -->
                      <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 25px 0; border-radius: 8px;">
                        <p style="margin: 0 0 10px 0; color: #2e7d32; font-weight: 600; font-size: 16px;">
                          ✅ Use Your Existing Password
                        </p>
                        <p style="margin: 0; color: #1b5e20; font-size: 14px; line-height: 1.6;">
                          <strong>No password change required!</strong> You can access the Admin Panel using your current password - the same one you use for the Agent Portal.
                        </p>
                      </div>
                      
                      <p style="margin: 25px 0 15px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        <strong>What's Next?</strong>
                      </p>
                      
                      <ol style="margin: 0 0 25px 0; padding-left: 20px; color: #555555; font-size: 14px; line-height: 1.8;">
                        <li>Visit the Admin Panel using the button below</li>
                        <li>Log in with your <strong>existing email and password</strong></li>
                        <li>Enter the OTP sent to your email</li>
                        <li>Start using your new admin privileges!</li>
                      </ol>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 35px 0;">
                        <a href="${adminPanelUrl}" 
                           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                          Access Admin Panel →
                        </a>
                      </div>
                      
                      <p style="margin: 25px 0 0 0; color: #999999; font-size: 13px; line-height: 1.6; text-align: center;">
                        Admin Panel URL: <a href="${adminPanelUrl}" style="color: #667eea; text-decoration: none;">${adminPanelUrl}</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                        <strong>Need Help?</strong>
                      </p>
                      <p style="margin: 0 0 15px 0; color: #999999; font-size: 13px; line-height: 1.6;">
                        If you have any questions or didn't expect this change, please contact your system administrator.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} AZAN-E-MADINA. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    };

    const mailOptions = {
      from: {
        name: "AZAN-E-MADINA - Admin Panel",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "🎉 Admin Panel Access Granted - AZAN-E-MADINA",
      html: getHTML(),
      text: `Hello ${userName},\n\nGreat news! You have been granted access to the Admin Panel.\n\nYour new roles:\n${roleNames.map(r => `- ${r}`).join('\n')}\n\nIMPORTANT: Use your existing password to login. No password change is required!\n\nAdmin Panel: ${adminPanelUrl}\n\nBest regards,\nAZAN-E-MADINA Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Internal staff access notification sent successfully!");
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending internal staff access notification:", error.message);
    throw new Error(`Failed to send internal staff access notification: ${error.message}`);
  }
};

// Send notification when Agent identity is added to existing Internal Staff user
export const sendAgentPortalAccessNotification = async (email, userName, companyName, agencyCode) => {
  try {
    const agentPortalUrl = process.env.AGENT_PORTAL_URL || 'http://localhost:5173';
    
    const getHTML = () => {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Agent Portal Access Granted</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f7ff;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f7ff; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                        ✈️ Agent Portal Access Granted!
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hello <strong>${userName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 25px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        Great news! Your <strong>Agent identity</strong> has been successfully created. You can now access the <strong>Agent Portal</strong> to manage bookings and travel services.
                      </p>
                      
                      <!-- Agency Info Box -->
                      <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-left: 4px solid #1e88e5; padding: 20px; margin: 25px 0; border-radius: 8px;">
                        <p style="margin: 0 0 10px 0; color: #0d47a1; font-weight: 600; font-size: 16px;">
                          📋 Your Agency Details
                        </p>
                        <table width="100%" cellpadding="8" cellspacing="0">
                          <tr>
                            <td style="color: #1565c0; font-weight: 500; font-size: 14px;">Agency Name:</td>
                            <td style="color: #0d47a1; font-weight: 600; font-size: 14px;">${companyName}</td>
                          </tr>
                          <tr>
                            <td style="color: #1565c0; font-weight: 500; font-size: 14px;">Agency Code:</td>
                            <td style="color: #0d47a1; font-weight: 600; font-size: 14px;">${agencyCode}</td>
                          </tr>
                        </table>
                      </div>
                      
                      <!-- Important Notice -->
                      <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 25px 0; border-radius: 8px;">
                        <p style="margin: 0 0 10px 0; color: #2e7d32; font-weight: 600; font-size: 16px;">
                          ✅ Use Your Existing Password
                        </p>
                        <p style="margin: 0; color: #1b5e20; font-size: 14px; line-height: 1.6;">
                          <strong>No password change required!</strong> You can access the Agent Portal using your current password - the same one you use for the Admin Panel.
                        </p>
                      </div>
                      
                      <p style="margin: 25px 0 15px 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        <strong>What's Next?</strong>
                      </p>
                      
                      <ol style="margin: 0 0 25px 0; padding-left: 20px; color: #555555; font-size: 14px; line-height: 1.8;">
                        <li>Visit the Agent Portal using the button below</li>
                        <li>Log in with your <strong>existing email and password</strong></li>
                        <li>Enter the OTP sent to your email</li>
                        <li>Start managing bookings and travel services!</li>
                      </ol>
                      
                      <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 8px;">
                        <p style="margin: 0; color: #e65100; font-size: 13px; line-height: 1.6;">
                          <strong>⚠️ Note:</strong> Your agent account status is currently <strong>Inactive</strong>. Please wait for admin approval before you can create bookings. You will receive another email once your account is activated.
                        </p>
                      </div>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 35px 0;">
                        <a href="${agentPortalUrl}" 
                           style="display: inline-block; background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(30, 136, 229, 0.4);">
                          Access Agent Portal →
                        </a>
                      </div>
                      
                      <p style="margin: 25px 0 0 0; color: #999999; font-size: 13px; line-height: 1.6; text-align: center;">
                        Agent Portal URL: <a href="${agentPortalUrl}" style="color: #1e88e5; text-decoration: none;">${agentPortalUrl}</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                        <strong>Need Help?</strong>
                      </p>
                      <p style="margin: 0 0 15px 0; color: #999999; font-size: 13px; line-height: 1.6;">
                        If you have any questions or didn't expect this change, please contact your system administrator.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} AZAN-E-MADINA. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    };

    const mailOptions = {
      from: {
        name: "AZAN-E-MADINA - Agent Portal",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "✈️ Agent Portal Access Granted - AZAN-E-MADINA",
      html: getHTML(),
      text: `Hello ${userName},\n\nGreat news! Your Agent identity has been successfully created.\n\nAgency Details:\n- Agency Name: ${companyName}\n- Agency Code: ${agencyCode}\n\nIMPORTANT: Use your existing password to login. No password change is required!\n\nNote: Your agent account status is Inactive. Please wait for admin approval.\n\nAgent Portal: ${agentPortalUrl}\n\nBest regards,\nAZAN-E-MADINA Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Agent portal access notification sent successfully!");
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending agent portal access notification:", error.message);
    throw new Error(`Failed to send agent portal access notification: ${error.message}`);
  }
};

export default {
  sendPasswordResetEmail,
  sendCredentialsEmail,
  sendAgentCredentialsEmail,
  sendAdminCredentialsEmail,
  sendAgentApprovalEmail,
  sendAgentStatusChangeEmail,
  sendBookingConfirmationEmail,
  sendBookingStatusChangeEmail,
  sendPaymentConfirmationEmail,
  sendPasswordChangeNotification,
  sendOTPEmail,
  sendInternalStaffAccessNotification,
  sendAgentPortalAccessNotification,
};
