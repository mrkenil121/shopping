import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { prisma } from '@/prisma';

dotenv.config();

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
    case 'DELETE':
      return deleteOrder(req, res, decoded);
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

async function deleteOrder(req, res, decoded) {
  const { id } = req.query;
  const userId = decoded.id;

  // Validate id
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  try {
    // Begin transaction
    const result = await prisma.$transaction(async (prisma) => {
      // First check if order belongs to user
      const order = await prisma.order.findFirst({
        where: {
          id: parseInt(id),
          userId: parseInt(userId)
        }
      });

      if (!order) {
        throw new Error('Order not found or unauthorized');
      }

      // Delete order items first due to foreign key constraints
      await prisma.orderItem.deleteMany({
        where: { orderId: parseInt(id) }
      });

      // Then delete the order
      const deletedOrder = await prisma.order.delete({
        where: { id: parseInt(id) }
      });

      return deletedOrder;
    });

    return res.status(200).json({ message: 'Order deleted successfully', order: result });
  } catch (error) {
    console.error('Failed to delete order:', error);
    if (error.message === 'Order not found or unauthorized') {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to delete order' });
  }
}