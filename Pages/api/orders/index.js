import jwt from "jsonwebtoken";
import { prisma } from "@/prisma/index";
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Enhanced authentication with role validation
const authenticateUser = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Authorization token missing or invalid.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Validate required fields in token
    if (!decoded.id || !decoded.role) {
      throw new Error("Invalid token payload");
    }
    
    return decoded;
  } catch (error) {
    throw new Error(error.message || "Invalid token.");
  }
};

// Rate limiting middleware (optional but recommended)
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
};

async function handler(req, res) {
  const { method } = req;

  let user;
  try {
    user = authenticateUser(req);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }

  switch (method) {
    case "GET": {
      try {
        // Add pagination support
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [orders, total] = await prisma.$transaction([
          prisma.order.findMany({
            where: user.role === "admin" ? {} : { userId: user.id },
            include: {
              items: {
                include: { product: true }
              },
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
          }),
          prisma.order.count({
            where: user.role === "admin" ? {} : { userId: user.id }
          })
        ]);

        return res.status(200).json({
          orders,
          pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
          }
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    case "POST": {
      const { productIds, totalAmount } = req.body;

      if (!productIds || !Array.isArray(productIds) || 
          productIds.length === 0 || 
          typeof totalAmount !== 'number' || 
          totalAmount <= 0) {
        return res.status(400).json({ 
          message: "Invalid request body. Product IDs must be an array and total amount must be a positive number." 
        });
      }

      try {
        const order = await prisma.$transaction(async (prisma) => {
          // Check product availability and validate prices
          const products = await prisma.product.findMany({
            where: { 
              id: { in: productIds },
              stock: { gt: 0 }
            }
          });

          if (products.length !== productIds.length) {
            throw new Error("Some products are unavailable or invalid");
          }

          // Validate total amount matches products
          const calculatedTotal = products.reduce((sum, product) => 
            sum + product.price, 0);

          if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
            throw new Error("Total amount doesn't match product prices");
          }

          // Create order with items
          return await prisma.order.create({
            data: {
              userId: user.id,
              totalAmount,
              status: "pending",
              items: {
                create: productIds.map((productId) => {
                  const product = products.find(p => p.id === productId);
                  return {
                    productId,
                    quantity: 1,
                    price: product.price,
                  };
                }),
              },
            },
            include: { 
              items: {
                include: { product: true }
              }
            },
          });
        });

        return res.status(201).json(order);
      } catch (error) {
        console.error("Error creating order:", error);
        if (error.message.includes("products") || error.message.includes("amount")) {
          return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

export default handler;