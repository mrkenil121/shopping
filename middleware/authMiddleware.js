// middlewares/authMiddleware.js
import { getSession } from "next-auth/react"; // Assuming you're using NextAuth.js for authentication

export const authMiddleware = (handler) => async (req, res) => {
  try {
    // Check if a session exists
    const session = await getSession({ req });
    if (!session) {
      // If there's no session, send an unauthorized response
      return res.status(401).json({ message: "You must be logged in to access this resource." });
    }
    
    // Add user data from session to the request
    req.user = session.user;
    
    // If authenticated, continue to the handler
    return handler(req, res);
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

