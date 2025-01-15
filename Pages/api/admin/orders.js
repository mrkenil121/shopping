import { PrismaClient } from '@prisma/client';
import { adminMiddleware } from '@/pages/api/admin/products';

const prisma = new PrismaClient();

export default adminMiddleware(async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGet(req, res);
        break;
      case 'POST':
        await handlePost(req, res);
        break;
      case 'PUT':
        await handlePut(req, res);
        break;
      case 'DELETE':
        await handleDelete(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Error in admin/orders API:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
});

// GET: Fetch all orders with user and product details
async function handleGet(req, res) {
  const { page = 1, pageSize = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true, // Include user details
        items: {
          include: {
            product: true, // Include product details
          },
        },
      },
    }),
    prisma.order.count(),
  ]);

  res.status(200).json({
    orders,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  });
}

// POST: Create a new order
async function handlePost(req, res) {
  const { userId, items, totalAmount, status } = req.body;

  if (!userId || !items || !totalAmount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newOrder = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      status: status || 'Pending',
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
  });

  res.status(201).json({ message: 'Order created successfully', order: newOrder });
}

// PUT: Update an existing order
async function handlePut(req, res) {
  const { id, status, items } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Order ID is required' });
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (items) {
    updateData.items = {
      deleteMany: {},
      create: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    };
  }

  const updatedOrder = await prisma.order.update({
    where: { id: Number(id) },
    data: updateData,
  });

  res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
}

// DELETE: Remove an order
async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Order ID is required' });
  }

  await prisma.order.delete({
    where: { id: Number(id) },
  });

  res.status(200).json({ message: 'Order deleted successfully' });
}
