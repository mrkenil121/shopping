import { adminMiddleware } from '@/middleware/adminMiddleware';
import { IncomingForm } from 'formidable';
import cloudinary from 'cloudinary';
import { prisma } from '@/prisma';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
  },
};

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
  const { page = 1, pageSize = 12 } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);

  try {
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          wsCode: true,
          salesPrice: true,
          mrp: true,
          packageSize: true,
          tags: true,
          category: true,
          images: true,
          createdAt: true,
        }
      }),
      prisma.product.count(),
    ]);

    res.status(200).json({
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / take),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products. Please try again.' });
  }
}

async function handlePost(req, res) {
  try {
    // Parse form data
    const form = new IncomingForm({ 
      multiples: true,
      keepExtensions: true // Add this to keep file extensions
    });
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Form parsing error:", err);
          reject(err);
        }

        resolve([fields, files]);
      });
    });

    // Initialize uploadedImages array
    const uploadedImages = [];

    // Handle image uploads with better error checking
    if (files && files.images) {
      const imageFiles = Array.isArray(files.images) ? files.images : [files.images];
      
      // Upload each image to Cloudinary
      for (const file of imageFiles) {
        if (!file.filepath) {
          console.error("No filepath found for file:", file);
          continue;
        }

        try {
          const result = await cloudinary.v2.uploader.upload(file.filepath, {
            folder: 'product_images',
            use_filename: true,
            resource_type: 'auto'
          });
          uploadedImages.push(result.secure_url);
        } catch (uploadError) {
          console.error("Cloudinary upload error for file:", file.filepath, uploadError);
          throw new Error(`Failed to upload image to Cloudinary: ${uploadError.message}`);
        }
      }
    }

    // Create new product with uploaded image URLs
    const productData = {
      name: fields.name[0],
      wsCode: Number(fields.wsCode[0]),
      salesPrice: Number(fields.salesPrice[0]),
      mrp: Number(fields.mrp[0]),
      packageSize: Number(fields.packageSize[0]),
      tags: JSON.parse(fields.tags[0]),
      category: fields.category[0],
      images: uploadedImages,
    };

    const newProduct = await prisma.product.create({
      data: productData
    });

    res.status(201).json({ 
      message: 'Product created successfully', 
      product: newProduct 
    });

  } catch (error) {
    console.error("Detailed error in handlePost:", error);
    res.status(500).json({ 
      message: error.message || 'Error creating product',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}

// Backend API handler
async function handlePut(req, res) {
  try {
    const form = new IncomingForm({ multiples: true });
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const id = Number(fields.id[0]);
    if (!id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Get existing product to compare images
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { images: true }
    });

    // Handle existing and new images
    let updatedImages = JSON.parse(fields.existingImages[0] || '[]');
    
    // Upload new images if any
    if (files.images) {
      const imageFiles = Array.isArray(files.images) ? files.images : [files.images];
      
      for (const file of imageFiles) {
        try {
          const result = await cloudinary.v2.uploader.upload(file.filepath, {
            folder: 'product_images',
            use_filename: true,
            resource_type: 'auto'
          });
          updatedImages.push(result.secure_url);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
        }
      }
    }

    // Prepare update data
    const updateData = {
      name: fields.name[0],
      wsCode: Number(fields.wsCode[0]),
      salesPrice: Number(fields.salesPrice[0]),
      mrp: Number(fields.mrp[0]),
      packageSize: Number(fields.packageSize[0]),
      tags: JSON.parse(fields.tags[0]),
      category: fields.category[0],
      images: updatedImages,
    };

    // Update product in database
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    // Clean up old images from Cloudinary if needed
    const removedImages = existingProduct.images.filter(
      img => !updatedImages.includes(img)
    );

    for (const imgUrl of removedImages) {
      try {
        const publicId = imgUrl.split('/').pop().split('.')[0];
        await cloudinary.v2.uploader.destroy(`product_images/${publicId}`);
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
    }

    res.status(200).json({ 
      message: 'Product updated successfully', 
      product: updatedProduct 
    });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ 
      message: 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}


async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) return res.status(400).json({ message: 'Product ID is required' });

  await prisma.product.delete({ where: { id: Number(id) } });

  res.status(200).json({ message: 'Product deleted successfully' });
}
