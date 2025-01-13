import { getSession } from "next-auth/react";
import { prisma } from "@/prisma/index"; // Assuming you have Prisma set up

// API handler for confirming an order
async function handler(req, res) {
  const { method } = req;
  const { id } = req.query; // Get order ID from URL parameter

  // Get the session to check if the user is authenticated
  const session = await getSession({ req });

  // If no session, return unauthorized error
  if (!session) {
    return res.status(401).json({ message: "You must be logged in to access this resource." });
  }

  // If the user is not an admin, return an unauthorized error for confirmation
  if (session.user.role !== "admin") {
    return res.status(403).json({ message: "You are not authorized to confirm this order." });
  }

  try {
    switch (method) {
      case "POST":
        // Confirm the order by updating its status
        const confirmedOrder = await prisma.order.update({
          where: { id: parseInt(id) },
          data: {
            status: "confirmed", // Change status to confirmed
          },
        });

        // If no order is found, return a 404 error
        if (!confirmedOrder) {
          return res.status(404).json({ message: "Order not found." });
        }

        // Return the confirmed order
        return res.status(200).json(confirmedOrder);

      default:
        // If method is not supported, return 405 (Method Not Allowed)
        return res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    // Return server error if something goes wrong
    console.error("Error confirming order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export default handler;
