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

  // Ensure the order ID is a valid number
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid order ID." });
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

        // Return the confirmed order
        return res.status(200).json(confirmedOrder);

      default:
        // If method is not supported, return 405 (Method Not Allowed)
        return res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    // If the order doesn't exist or other error occurs, return a 404 error
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Order not found." });
    }

    // Return server error if something goes wrong
    console.error("Error confirming order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export default handler;
