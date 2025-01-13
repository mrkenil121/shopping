// pages/api/protectedRoute.js
import { authMiddleware } from "@/middlewares/authMiddleware";

async function handler(req, res) {
  if (req.method === "GET") {
    // Protected logic for authenticated users
    res.status(200).json({ message: "Welcome, Authenticated User!" });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

export default authMiddleware(handler);
