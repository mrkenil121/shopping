import jwt from 'jsonwebtoken';
import { prisma } from '@/prisma'; // Assuming Prisma is used for database operations

export default async function handler(req, res) {
  const {
    query: { id }, // Extract cart item ID from the URL
    method,
  } = req;

  // Check for token in the Authorization header
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret here
    const userId = decoded.userId; // Assuming the JWT contains userId as a payload

    // Handle different request methods
    if (method === "PUT") {
      // Update cart item quantity
      const { quantity } = req.body; // Get new quantity from request body

      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      // Find the cart item by ID and update its quantity
      const cartItem = await prisma.cartItem.update({
        where: { id: Number(id) }, // Convert id to a number
        data: { quantity },
      });

      // Find the updated cart and calculate the total price
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          cartItems: true, // Include the cart items to calculate total price
        },
      });

      const totalPrice = cart.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

      // Respond with updated cart items and total price
      return res.status(200).json({ cartItems: cart.cartItems, totalPrice });

    } else {
      res.setHeader("Allow", ["PUT"]);
      return res.status(405).json({ message: `Method ${method} not allowed` });
    }
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
