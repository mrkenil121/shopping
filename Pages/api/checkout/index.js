import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.setHeader("Allow", ["POST"]).status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token not provided" });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Fetch the user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: {
            product: true, // Include product details for price and validation
          },
        },
      },
    });

    if (!cart || cart.cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate stock and calculate the total amount
    let totalAmount = 0;
    for (const item of cart.cartItems) {
      const { product, quantity } = item;
      if (product.packageSize < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name}`,
        });
      }
      totalAmount += product.salesPrice * quantity;
    }

    // Create a new order
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: "pending", // Default status
        orderItems: {
          create: cart.cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.salesPrice,
          })),
        },
      },
    });

    // Update stock for each product
    await Promise.all(
      cart.cartItems.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: {
            packageSize: {
              decrement: item.quantity,
            },
          },
        })
      )
    );

    // Clear the user's cart after successful checkout
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return res.status(201).json({
      message: "Checkout successful",
      orderId: order.id,
    });
  } catch (error) {
    console.error("Checkout API Error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}
