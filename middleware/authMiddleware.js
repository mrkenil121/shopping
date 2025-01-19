import jwt from 'jsonwebtoken';

export const authMiddleware = (handler) => async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: No token provided",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user to request
    req.user = decoded;

    return handler(req, res);
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      message: "Unauthorized: Invalid token",
    });
  }
};