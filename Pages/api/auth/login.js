import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { setCookie } from 'nookies'; // Optional: To set the JWT in cookies
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Create a new PrismaClient instance

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
      // Find the user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      // Check if password matches
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      // Create a JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Optionally, set the JWT token in a cookie
      setCookie({ res }, 'auth_token', token, {
        maxAge: 60 * 60, // 1 hour
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Ensure secure cookies in production
      });

      return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
