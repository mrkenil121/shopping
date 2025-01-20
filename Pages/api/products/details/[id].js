import { prisma } from "@/prisma/index";
import { NextResponse } from 'next/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        cartItems: false, // Exclude sensitive relations
        orderItems: false
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const similarProducts = await prisma.product.findMany({
      where: {
        AND: [
          { category: product.category },
          { id: { not: productId } }
        ]
      },
      take: 4,
      select: {
        id: true,
        name: true,
        salesPrice: true,
        mrp: true,
        images: true,
        packageSize: true,
        category: true
      }
    });

    return res.status(200).json({
      product,
      similarProducts
    });
  } catch (error) {
    console.error('Error in product details API:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  } finally {
    await prisma.$disconnect();
  }
}