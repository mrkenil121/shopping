import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  
    try {
      const { wsCode, productId } = req.body;
  
      const existingProduct = await prisma.product.findFirst({
        where: {
          wsCode: parseInt(wsCode),
          ...(productId && {
            NOT: {
              id: parseInt(productId)
            }
          })
        },
        select: {
          id: true
        }
      });
  
      return res.status(200).json({
        isUnique: !existingProduct
      });
    } catch (error) {
      console.error('Error checking WS code:', error);
      return res.status(500).json({ 
        message: 'Error checking WS code uniqueness',
        error: error.message 
      });
    }
  }