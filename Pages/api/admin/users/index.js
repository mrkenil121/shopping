// File: pages/api/admin/users/index.js
import jwt from 'jsonwebtoken';
import { prisma } from '@/prisma';

// Authentication middleware
const authenticateAdmin = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || user.role !== 'admin') {
      throw new Error('Not authorized');
    }

    return user;
  } catch (error) {
    throw new Error('Authentication failed');
  }
};

export default async function handler(req, res) {
  try {
    // Authenticate admin for all routes
    await authenticateAdmin(req, res);

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    if (error.message === 'Authentication failed' || error.message === 'Not authorized') {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET: Fetch all users with pagination
async function handleGet(req, res) {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * Number(limit);

    // Build the where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    return res.status(200).json({
      users,
      pagination: {
        total,
        pages: Math.ceil(total / Number(limit)),
        current: Number(page),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

// PUT: Update user role
async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const { role } = req.body;

    if (!id || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role
    if (!['admin', 'customer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}

// DELETE: Delete user
async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deleting the last admin
    if (existingUser.role === 'admin') {
      const adminCount = await prisma.user.count({
        where: { role: 'admin' },
      });

      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    // Delete related cart items first
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId: Number(id),
        },
      },
    });

    // Delete user's cart
    await prisma.cart.delete({
      where: {
        userId: Number(id),
      },
    }).catch(() => {
      // Ignore if cart doesn't exist
    });

    // Delete user's order items
    await prisma.orderItem.deleteMany({
      where: {
        order: {
          userId: Number(id),
        },
      },
    });

    // Delete user's orders
    await prisma.order.deleteMany({
      where: {
        userId: Number(id),
      },
    });

    // Finally, delete the user
    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}