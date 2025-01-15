import { getSession } from "next-auth/react";
import { prisma } from "@/prisma/index"; // Assuming you have Prisma set up

// API handler for fetching, updating, and deleting an order by ID
async function handler(req, res) {
  const { method } = req;
  const { id } = req.query; // Get order ID from the URL parameter
  const orderId = parseInt(id);

  // If ID is not valid, return a 400 error
  if (isNaN(orderId)) {
    return res.status(400).json({ message: "Invalid order ID." });
  }

  // Get the session to check if the user is authenticated
  const session = await getSession({ req });

  // If no session, return unauthorized error
  if (!session) {
    return res.status(401).json({ message: "You must be logged in to access this resource." });
  }

  try {
    switch (method) {
      case "GET":
        // Fetch order details by ID
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        // If no order is found, return a 404 error
        if (!order) {
          return res.status(404).json({ message: "Order not found." });
        }

        return res.status(200).json(order);

      case "PUT":
        // Only admins can update orders
        if (session.user.role !== "admin") {
          return res.status(403).json({ message: "You are not authorized to update this order." });
        }

        const { status, totalAmount } = req.body;

        // Validate status if provided
        const validStatuses = ["pending", "confirmed", "shipped"];
        if (status && !validStatuses.includes(status)) {
          return res.status(400).json({ message: "Invalid status." });
        }

        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: status || undefined,
            totalAmount: totalAmount || undefined,
          },
        });

        return res.status(200).json(updatedOrder);

      case "DELETE":
        // Only admins can delete orders
        if (session.user.role !== "admin") {
          return res.status(403).json({ message: "You are not authorized to delete this order." });
        }

        const deletedOrder = await prisma.order.delete({
          where: { id: orderId },
        });

        return res.status(200).json(deletedOrder);

      default:
        // If method is not supported, return 405 (Method Not Allowed)
        return res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error(`[${method}]: Error with order ID ${id}`, error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export default handler;
