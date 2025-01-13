import { prisma } from "@/prisma/index"; // Adjust the path based on your project structure
import { authMiddleware } from "@/middlewares/authMiddleware";
import { adminMiddleware } from "@/middlewares/adminMiddleware";
import { uploadImage } from "@/utils/cloudinary"; // Import the uploadImage function from utils/cloudinary

// Handler for managing products
async function handler(req, res) {
  const { method } = req;

  try {
    // GET request: Fetch all products
    if (method === "GET") {
      const products = await prisma.product.findMany();
      return res.status(200).json(products);
    }

    // POST request: Create a new product
    if (method === "POST") {
      const { name, wsCode, salesPrice, mrp, packageSize, tags, category, images } = req.body;

      // Validate the input data (basic validation can be expanded based on needs)
      if (!name || !wsCode || !salesPrice || !mrp || !tags || !category || !images) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Upload image to Cloudinary
      const uploadedImages = [];
      for (let i = 0; i < images.length; i++) {
        const uploadedImage = await uploadImage(images[i]);
        uploadedImages.push(uploadedImage.secure_url); // Store the Cloudinary URL
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
          images: uploadedImages, // Save Cloudinary URLs
        },
      });

      return res.status(201).json(newProduct);
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
