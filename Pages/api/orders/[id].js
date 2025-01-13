import { getSession } from "next-auth/react";
import { prisma } from "@/prisma/index"; // Assuming you have Prisma set up

// API handler for fetching, updating, and deleting an order by ID
async function handler(req, res) {
  const { method } = req;
  const { id } = req.query; // Get order ID from the URL parameter

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
          where: { id: parseInt(id) }, // Find the order by ID
          include: { items: true }, // Include the items related to the order
        });

        // If no order is found, return a 404 error
        if (!order) {
          return res.status(404).json({ message: "Order not found." });
        }

        // Return the order details
        return res.status(200).json(order);

      case "PUT":
        // Update order details (only allowed for certain users)
        if (session.user.role !== "admin") {
          return res.status(403).json({ message: "You are not authorized to update this order." });
        }

        const { status, totalAmount } = req.body; // Extract the data to update
        const updatedOrder = await prisma.order.update({
          where: { id: parseInt(id) },
          data: {
            status: status || undefined, // If provided, update status
            totalAmount: totalAmount || undefined, // If provided, update total amount
          },
        });

        return res.status(200).json(updatedOrder);

      case "DELETE":
        // Delete an order (only allowed for admins)
        if (session.user.role !== "admin") {
          return res.status(403).json({ message: "You are not authorized to delete this order." });
        }

        const deletedOrder = await prisma.order.delete({
          where: { id: parseInt(id) },
        });

        return res.status(200).json(deletedOrder);

      default:
        // If method is not supported, return 405 (Method Not Allowed)
        return res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    // Return server error if something goes wrong
    console.error("Error handling order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export default handler;
