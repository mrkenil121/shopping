// pages/api/admin/orders.js
import { authMiddleware } from "@/middlewares/authMiddleware";
import { adminMiddleware } from "@/middlewares/adminMiddleware";
import prisma from "@/lib/prisma"; // Assuming you're using Prisma to interact with the database

// GET method to retrieve all orders (admin-only)
async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Fetch all orders with their related user data
      const orders = await prisma.order.findMany({
        include: {
          user: true, // Include user details in the order
          items: {
            include: {
              product: true, // Include product details for each order item
            },
          },
        },
      });

      // Send the orders as a response
      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // Handle unsupported methods
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

export default authMiddleware(adminMiddleware(handler));
