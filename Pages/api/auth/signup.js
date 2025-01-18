// pages/api/auth/signup.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import nodemailer from 'nodemailer'; // Install with: npm install nodemailer

const prisma = new PrismaClient();

// Email configuration - Replace with your email service details
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generate a random 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
async function sendVerificationEmail(email, code, name) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Mshopping Verification Code',
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
        <h2>Hello, ${name}</h2>
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

  const { name, email, password } = req.body;

  // Input validation
  if (!name || name.length < 3 || name.length > 50) {
    return res.status(400).json({ message: 'Name must be between 3 and 50 characters' });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if user already exists in either User or TempUser table
    const existingUser = await prisma.user.findUnique({ where: { email } });
    const existingTempUser = await prisma.tempUser.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    // If there's an existing temp user, delete it (this handles expired/abandoned registrations)
    if (existingTempUser) {
      await prisma.tempUser.delete({ where: { email } });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Set expiration time (1 hour from now)
    const expiresAt = new Date(Date.now() + 600000); // 1 hour

    // Create temporary user
    const tempUser = await prisma.tempUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationCode,
        expiresAt,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationCode, name);

    // Respond with success message
    return res.status(201).json({ 
      message: 'Registration initiated. Please check your email for verification code.',
      email: tempUser.email
    });

  } catch (error) {
    console.error('Error during user registration:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}