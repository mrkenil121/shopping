import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Middleware to verify admin role
const verifyAdmin = async (token) => {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { role: true }
    });
    return user?.role === 'admin' ? decoded : null;
  } catch (error) {
    return null;
  }
};

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const admin = await verifyAdmin(token);

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      return getOrders(req, res);
    case 'PUT':
      return updateOrder(req, res);
    case 'DELETE':
      return deleteOrder(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                salesPrice: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

// Backend (API handler)
async function updateOrder(req, res) {
  const { id } = req.query;

  // Validate id
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  try {
    const { status } = req.body;
    
    // Validate status - using lowercase to match frontend
    const validStatuses = ['pending', 'accepted'];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { 
        status: status.toLowerCase() // Ensure status is stored in lowercase
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
              }
            }
          }
        }
      }
    });

    return res.status(200).json(order);
  } catch (error) {
    console.error('Failed to update order:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.status(500).json({ error: 'Failed to update order' });
  }
}

async function deleteOrder(req, res) {
  const { id } = req.query;

  // Validate id
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  try {
    // Begin transaction
    const result = await prisma.$transaction(async (prisma) => {
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
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.status(500).json({ error: 'Failed to delete order' });
  }
}