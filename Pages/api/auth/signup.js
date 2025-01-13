// pages/api/auth/signup.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import validator from 'validator'; // Install with npm if not already

const prisma = new PrismaClient();

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
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Respond with limited user data (exclude password)
    return res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    console.error('Error during user creation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
