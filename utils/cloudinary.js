import { prisma } from "@/prisma/index"; // Adjust the path based on your project structure
import { authMiddleware } from "@/middlewares/authMiddleware";
import { adminMiddleware } from "@/middlewares/adminMiddleware";
const cloudinary = require("cloudinary").v2; // Add cloudinary import

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Handler for managing products
async function handler(req, res) {
  const { method } = req;
  const { id } = req.query; // Get the product ID from the URL

  try {
    // GET request: Fetch all products
    if (method === "GET") {
      const products = await prisma.product.findMany();
      return res.status(200).json(products);
    }

    // POST request: Create a new product
    if (method === "POST") {
      const { name, wsCode, salesPrice, mrp, packageSize, tags, category, images } = req.body;

      // Validate the input data
      if (!name || !wsCode || !salesPrice || !mrp || !tags || !category || !images) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Create the new product
      const newProduct = await prisma.product.create({
        data: {
          name,
          wsCode,
          salesPrice,
          mrp,
          packageSize,
          tags,
          category,
          images,
        },
      });

      return res.status(201).json(newProduct);
    }

    // DELETE request: Delete a product by ID
    if (method === "DELETE") {
      // Find the product to get the image's public_id
      const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Delete the image from Cloudinary
      if (product.images) {
        const imagePublicId = product.images.split("/").pop().split(".")[0]; // Extract public_id from image URL
        await cloudinary.uploader.destroy(imagePublicId);
      }

      // Delete the product from the database
      await prisma.product.delete({
        where: { id: parseInt(id) },
      });

      return res.status(200).json({ message: "Product deleted successfully" });
    }

    // Handle unsupported methods
    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

// Protect the handler with both authentication and admin middleware
export default authMiddleware(adminMiddleware(handler));
