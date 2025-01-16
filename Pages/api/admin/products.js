import { PrismaClient } from '@prisma/client';
import { validateProduct } from '@/utils/validators';
import { adminMiddleware } from '@/middleware/adminMiddleware';

const prisma = new PrismaClient();

export default adminMiddleware(async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Error in admin/products API:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
});

async function handleGet(req, res) {
  const { page = 1, pageSize = 10 } = req.query; // Destructuring from req.query, not req.query.page
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);

  try {
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count(),
    ]);

    res.status(200).json({
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products. Please try again.' });
  }
}


async function handlePost(req, res) {
  const { name, wsCode, salesPrice, mrp, packageSize, tags, category, images } = req.body;

  // const validationError = validateProduct({ name, wsCode, salesPrice, mrp, packageSize, tags, category, images });
  // if (validationError) return res.status(400).json({ message: validationError });

  const newProduct = await prisma.product.create({
    data: { name, wsCode, salesPrice, mrp, packageSize, tags, category, images },
  });

  res.status(201).json({ message: 'Product created successfully', product: newProduct });
}

async function handlePut(req, res) {
  const { id, ...data } = req.body;

  console.log(req.body);


  if (!id) return res.status(400).json({ message: 'Product ID is required' });

  // const validationError = validateProduct(data);
  // if (validationError) return res.status(400).json({ message: validationError });

  const updatedProduct = await prisma.product.update({
    where: { id },
    data,
  });

  res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
}

async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) return res.status(400).json({ message: 'Product ID is required' });

  await prisma.product.delete({ where: { id: Number(id) } });

  res.status(200).json({ message: 'Product deleted successfully' });
}
