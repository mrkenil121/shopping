import jwt from 'jsonwebtoken';
import { parseCookies } from 'nookies';
import { prisma } from '@/prisma';

export const adminMiddleware = (handler) => async (req, res) => {
  try {
    // Extract the token from Authorization header or cookies
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Authentication token not found." });
    }

    // Verify the token
    const decoded = JSON.parse(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    // Attach user information to request object
    req.user = { id: decoded.id, email: decoded.email, name: decoded.name, role: decoded.role };

    // Continue with the next handler
    return handler(req, res);
  } catch (error) {
    console.error("Error in admin middleware:", error);
    return res.status(500).json({ message: "Internal Server Error: Error verifying admin role." });
  }
};
