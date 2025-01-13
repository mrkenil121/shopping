import { adminMiddleware } from "@/middlewares/adminMiddleware";

async function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json({ message: "Admin can view all products" });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

export default adminMiddleware(handler);
