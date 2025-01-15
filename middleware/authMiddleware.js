import jwt from 'jsonwebtoken'; // Import the jwt library
import { parseCookies } from 'nookies'; // Optional: Use nookies for easier cookie parsing

/**
 * Middleware to enforce authentication on API routes using JWT.
 * @param {Function} handler - The API route handler function.
 * @returns {Function} Middleware-wrapped handler.
 */
export const authMiddleware = (handler) => async (req, res) => {
  try {
    // Get the token from the Authorization header or cookies
    let token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header (Bearer token)
    
    if (!token) {
      const cookies = parseCookies({ req });
      token = cookies.auth_token; // Get token from cookies if it's not in the header
    }

    // If no token is found, return an unauthorized response
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: Authentication token not found.",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the JWT using your secret key

    // Attach the decoded user details to the request object (e.g., user ID)
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role, // Attach the role if available in the token
    };

    // Proceed to the next middleware or API route handler
    return handler(req, res);
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    return res.status(401).json({
      message: "Unauthorized: Invalid or expired token.",
    });
  }
};
