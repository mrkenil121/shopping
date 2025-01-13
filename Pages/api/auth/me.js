import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { parseCookies } from 'nookies'; // You can use this for easier cookie parsing

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Extract the token from the cookies
    const cookies = parseCookies({ req });
    const token = cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: 'Authentication token not found' });
    }

    // Verify the JWT token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      // Fetch the user based on the decoded userId from the token
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return the user data (excluding password)
      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
