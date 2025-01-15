import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';  // Import jsonwebtoken for token creation
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Validate environment variables
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      throw new Error('Server configuration error.');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid login credentials.' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid login credentials.' });
    }

    // Create JWT token with user info (including role)
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,  // Include the role in the JWT token
      },
      process.env.JWT_SECRET,  // Your JWT secret key
      { expiresIn: '1h' }  // Token expires in 1 hour (adjust as needed)
    );

    // Send success response with token
    return res.status(200).json({
      message: 'Login successful',
      token,  // Send the JWT token in the response
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
