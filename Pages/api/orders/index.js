import { getSession } from "next-auth/react";
import { prisma } from "@/prisma/index"; // Assuming you have Prisma set up

// API handler for creating and fetching orders
async function handler(req, res) {
  const { method } = req;

  // Get the session to check if the user is authenticated
  const session = await getSession({ req });

  // If no session, return unauthorized error
  if (!session) {
    return res.status(401).json({ message: "You must be logged in to access this resource." });
  }

  switch (method) {
    case "GET":
      // Fetch all orders if the user is an admin or their own orders if the user is not an admin
      try {
        const orders = session.user.role === "admin"
          ? await prisma.order.findMany()  // Admin can see all orders
          : await prisma.order.findMany({
              where: { userId: session.user.id }, // Non-admin users can only see their own orders
            });

        return res.status(200).json(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

    case "POST":
      // Create a new order
      const { productIds, totalAmount } = req.body;

      // Check if productIds and totalAmount are provided
      if (!productIds || productIds.length === 0 || !totalAmount) {
        return res.status(400).json({ message: "Product IDs and total amount are required." });
      }

      // Create a new order in the database
      try {
        const order = await prisma.order.create({
          data: {
            userId: session.user.id, // Associate the order with the logged-in user
            productIds: productIds, // Array of product IDs
            totalAmount: totalAmount, // Total price of the order
            status: "pending", // New orders are created with a pending status
            items: {
              create: productIds.map(productId => ({
                productId: productId,
                quantity: 1, // Assuming default quantity is 1. Modify if needed
                price: 100.00, // Example price. Modify according to actual pricing logic
              })),
            },
          },
        });

        return res.status(201).json(order); // Return the created order
      } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

    default:
      // If method is not supported, return 405 (Method Not Allowed)
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

export default handler;
