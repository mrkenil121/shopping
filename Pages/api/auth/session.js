// pages/api/auth/session.js
import { authMiddleware } from "@/middleware/authMiddleware"; // Import the auth middleware
import { prisma } from "@/prisma/index"; // Assuming you're using Prisma to interact with the database

// GET method to check if the user is authenticated and return their session
async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Check if the user is authenticated (using the authMiddleware)
      const session = req.session; // Assuming session is added to the request by the middleware

      if (!session?.userId) {
        return res.status(401).json({ message: "Unauthorized" }); // If no userId in session, return Unauthorized
      }

      // Fetch the user from the database using their userId from the session
      const user = await prisma.user.findUnique({
        where: {
          id: session.userId,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" }); // If user is not found in the database
      }

      // Return the user session data (e.g., user name, email, role, etc.)
      res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // Handle unsupported HTTP methods
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

export default authMiddleware(handler);
