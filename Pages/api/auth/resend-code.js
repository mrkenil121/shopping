// pages/api/auth/resend-code.js
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generate a new 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
async function sendVerificationEmail(email, code) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'New Mshopping Verification Code',
    html: `
      <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Code</title>
      <style>
        /* Add your styles here */
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .code { font-weight: bold; font-size: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Hello,</h2>
        <p>Thank you for registering. Please use the following verification code to complete your registration:</p>
        <p class="code">${code}</p>
        <p>If you did not request this code, please ignore this email.</p>
      </div>
    </body>
    </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Find the temporary user
    const tempUser = await prisma.tempUser.findUnique({
      where: { email }
    });

    if (!tempUser) {
      return res.status(404).json({ 
        message: 'No pending verification found for this email'
      });
    }

    // Generate new verification code and update expiration
    const newVerificationCode = generateVerificationCode();
    const newExpiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Update the temp user with new code and expiration
    await prisma.tempUser.update({
      where: { email },
      data: {
        verificationCode: newVerificationCode,
        expiresAt: newExpiresAt,
      }
    });

    // Send new verification email
    await sendVerificationEmail(email, newVerificationCode);

    return res.status(200).json({ 
      message: 'New verification code sent successfully' 
    });

  } catch (error) {
    console.error('Error resending verification code:', error);
    return res.status(500).json({ 
      message: 'Failed to resend verification code' 
    });
  }
}