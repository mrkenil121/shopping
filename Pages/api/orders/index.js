import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';  // Add this import

const prisma = new PrismaClient();

// GET /api/orders - Fetch all orders for the current user
export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: 'Token not provided' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
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
                salesPrice: true,  // Added to match schema
                wsCode: true,      // Added to match schema
                packageSize: true  // Added to match schema
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);

  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order

export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: 'Token not provided' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const userId = decoded.id;
    const { orderItems } = await req.json();

    const order = await prisma.$transaction(async (tx) => {
      // Calculate total using the product's salesPrice from the database
      const itemsWithPrices = await Promise.all(
        orderItems.map(async (item) => {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { salesPrice: true }
          });
          return {
            ...item,
            price: product.salesPrice // Use the current price from the database
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

      // Clear the user's cart
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

    return NextResponse.json(order);

  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
// PATCH /api/orders/:id - Update order status
export async function PATCH(req, { params }) {
  try {

    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    const userId = decoded.id;

    const { status } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the order belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(params.id),
        userId: parseInt(userId),
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: {
        id: parseInt(params.id),
      },
      data: {
        status,
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);

  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}