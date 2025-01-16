import jwt from "jsonwebtoken";
import { prisma } from "@/prisma/index";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Authentication token missing or invalid.");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.id || !decoded.role) {
      throw new Error("Invalid token payload");
    }
    return decoded;
  } catch (error) {
    throw new Error(error.message || "Invalid or expired token.");
  }
}

async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  const orderId = parseInt(id);

  if (isNaN(orderId)) {
    return res.status(400).json({ message: "Invalid order ID." });
  }

  try {
    const user = await verifyToken(req);

    switch (method) {
      case "GET": {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (!order) {
          return res.status(404).json({ message: "Order not found." });
        }

        if (user.role !== "admin" && order.userId !== user.id) {
          return res.status(403).json({ 
            message: "You are not authorized to view this order." 
          });
        }

        return res.status(200).json(order);
      }

      case "PUT": {
        if (user.role !== "admin") {
          return res.status(403).json({ 
            message: "You are not authorized to update this order." 
          });
        }

        const { status, totalAmount } = req.body;
        const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
        
        if (status && !validStatuses.includes(status)) {
          return res.status(400).json({ 
            message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
          });
        }

        if (totalAmount && (typeof totalAmount !== 'number' || totalAmount <= 0)) {
          return res.status(400).json({ 
            message: "Total amount must be a positive number." 
          });
        }

        const existingOrder = await prisma.order.findUnique({
          where: { id: orderId }
        });

        if (!existingOrder) {
          return res.status(404).json({ message: "Order not found." });
        }

        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: status || undefined,
            totalAmount: totalAmount || undefined,
          },
        });

        return res.status(200).json(updatedOrder);
      }

      case "DELETE": {
        if (user.role !== "admin") {
          return res.status(403).json({ 
            message: "You are not authorized to delete this order." 
          });
        }

        const existingOrder = await prisma.order.findUnique({
          where: { id: orderId }
        });

        if (!existingOrder) {
          return res.status(404).json({ message: "Order not found." });
        }

        const deletedOrder = await prisma.order.delete({
          where: { id: orderId },
        });

        return res.status(200).json(deletedOrder);
      }

      default:
        return res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error(`[${method}]: Error with order ID ${id}`, error);
    if (error.message.includes("Authentication")) {
      return res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

export default handler;