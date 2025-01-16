import jwt from 'jsonwebtoken';
import { prisma } from "@/prisma"; // Assuming Prisma is used for database operations

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace("Bearer ", "");// Extract token after "Bearer"
  

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret here
    const userId = decoded.id; // Assuming the JWT contains userId as a payload

    if (req.method === "GET") {
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          cartItems: {
            include: {
              product: true, // Assuming product details are needed
            },
          },
        },
      });

      if (!cart) {
        // Automatically create an empty cart if one doesn't exist for the user
        const newCart = await prisma.cart.create({
          data: {
            userId,
            cartItems: { create: [] },
          },
          include: { cartItems: true },
        });

        return res.status(200).json({ cartItems: newCart.cartItems, totalPrice: 0 });
      }

      const totalPrice = cart.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

      return res.status(200).json({ cartItems: cart.cartItems, totalPrice });
    } else if (req.method === "PUT") {
      const { id, quantity } = req.body;

      if (!id || !quantity) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const cartItem = await prisma.cartItem.update({
        where: { id },
        data: { quantity },
      });

      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          cartItems: true,
        },
      });

      const totalPrice = cart.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

      return res.status(200).json({ cartItems: cart.cartItems, totalPrice });
    } else if (req.method === "POST") {
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { cartItems: true },
      });

      if (!cart || cart.cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const order = await prisma.order.create({
        data: {
          userId,
          total: cart.cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
          orderItems: {
            create: cart.cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

      return res.status(200).json({ message: "Checkout successful", order });
    } else {
      res.setHeader("Allow", ["GET", "PUT", "POST"]);
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
