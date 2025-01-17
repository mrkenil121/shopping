import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const admin = await verifyAdmin(token);

    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get total counts
    const [totalOrders, totalProducts, totalUsers] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count({
        where: {
          role: 'customer'
        }
      })
    ]);

    // Get recent items
    const [recentOrders, recentProducts, recentUsers] = await Promise.all([
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          status: true,
          totalAmount: true
        }
      }),
      prisma.product.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          salesPrice: true,
          wsCode: true
        }
      }),
      prisma.user.findMany({
        where: {
          role: 'customer'
        },
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      })
    ]);

    const dashboardData = {
      metrics: {
        totalOrders,
        totalProducts,
        totalUsers,
        recentOrders,
        recentProducts,
        recentUsers
      }
    };

    return res.status(200).json(dashboardData);

  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  } finally {
    await prisma.$disconnect();
  }
}