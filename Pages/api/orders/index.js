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
          ? await prisma.order.findMany({
              include: {
                items: { include: { product: true } }, // Include product details for admin view
              },
            })
          : await prisma.order.findMany({
              where: { userId: session.user.id }, // Non-admin users can only see their own orders
              include: {
                items: { include: { product: true } }, // Include product details for non-admin users
              },
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

      try {
        // Fetch the product details (e.g., prices) before creating the order
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
        });

        if (products.length !== productIds.length) {
          return res.status(400).json({ message: "Some products were not found." });
        }

        // Calculate the total amount based on fetched product prices
        const calculatedTotalAmount = products.reduce((acc, product) => {
          const productInOrder = productIds.find(id => id === product.id);
          // Assuming 1 quantity per product
          return acc + (product.price * 1); // Multiply by quantity if it's not 1
        }, 0);

        if (calculatedTotalAmount !== totalAmount) {
          return res.status(400).json({ message: "Total amount does not match the sum of product prices." });
        }

        // Create the order with associated products
        const order = await prisma.order.create({
          data: {
            userId: session.user.id, // Associate the order with the logged-in user
            totalAmount: totalAmount, // The provided total amount
            status: "pending", // New orders are created with a pending status
            items: {
              create: productIds.map((productId) => ({
                productId: productId,
                quantity: 1, // Default quantity is 1
                price: products.find((product) => product.id === productId).price, // Use the actual product price
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
