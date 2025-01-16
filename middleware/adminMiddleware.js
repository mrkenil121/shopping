import jwt from 'jsonwebtoken';
import { prisma } from '@/prisma';
import dotenv from 'dotenv';
dotenv.config();

export const adminMiddleware = (handler) => async (req, res) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Authentication token not found." });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Unauthorized: Invalid or malformed token. Missing user ID." });
    }

    // Fetch user details from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user's role is "admin"
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    // Attach user information to the request object
    req.user = { id: decoded.id, role: user.role };

    // Continue with the next handler
    return handler(req, res);
  } catch (error) {
    console.error("Error in admin middleware:", error);

    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token has expired." });
    }

    return res.status(500).json({ message: "Internal Server Error: Error verifying admin role." });
  }
};
