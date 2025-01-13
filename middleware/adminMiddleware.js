import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma"; // Adjust the path to your Prisma client

/**
 * Middleware to verify if the user has admin privileges.
 * @param {Function} handler - The next function to call if the user is an admin.
 */
export function adminMiddleware(handler) {
  return async (req = NextApiRequest, res = NextApiResponse) => {
    try {
      // Get the session from NextAuth
      const session = await getSession({ req });

      if (!session) {
        return res.status(401).json({ message: "Unauthorized: No session found" });
      }

      // Fetch the user from the database based on their email
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the user role is "admin"
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admins only" });
      }

      // Proceed to the next function
      return handler(req, res);
    } catch (error) {
      console.error("Admin middleware error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
}
