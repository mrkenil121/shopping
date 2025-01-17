import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// Add JWT verification middleware
const verifyToken = (token, secret) => {
  try {
    if (!token) return null;
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

export default async function handler(req, res) {
  // Get and verify token first
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication token is required' });
  }

  const decoded = verifyToken(token, process.env.JWT_SECRET);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getOrders(req, res, decoded);
    case 'POST':
      return createOrder(req, res, decoded);
    case 'PATCH':
      return updateOrder(req, res, decoded);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getOrders(req, res, decoded) {
  try {
    const userId = decoded.id;
    
    const orders = await prisma.order.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                salesPrice: true,
                wsCode: true,
                packageSize: true
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

async function createOrder(req, res, decoded) {
  try {
    const userId = decoded.id;
    const { orderItems } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ error: 'Invalid order items' });
    }

    const order = await prisma.$transaction(async (tx) => {
      const itemsWithPrices = await Promise.all(
        orderItems.map(async (item) => {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { salesPrice: true }
          });
          
          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }
          
          return {
            ...item,
            price: product.salesPrice
          };
        })
      );

      const totalAmount = itemsWithPrices.reduce(
        (sum, item) => sum + (item.quantity * item.price),
        0
      );

      const newOrder = await tx.order.create({
        data: {
          userId: parseInt(userId),
          totalAmount,
          status: 'pending',
          orderItems: {
            create: itemsWithPrices.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  salesPrice: true,
                  wsCode: true,
                  packageSize: true
                },
              },
            },
          },
        },
      });

      // Clear the cart after successful order creation
      await tx.cart.update({
        where: { userId: parseInt(userId) },
        data: {
          cartItems: {
            deleteMany: {},
          },
        },
      });

      return newOrder;
    });

    return res.status(200).json(order);
  } catch (error) {
    console.error('Failed to create order:', error);
    return res.status(500).json({ 
      error: 'Failed to create order',
      details: error.message 
    });
  }
}
