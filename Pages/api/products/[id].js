import { prisma } from "@/prisma/index"; // Adjust the path based on your project structure
import { authMiddleware } from "@/middlewares/authMiddleware";
import { adminMiddleware } from "@/middlewares/adminMiddleware";
import { validateProduct } from "@/utils/validators"; // Import the validation function

// This handler will be used for both fetching a single product and updating it
async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  try {
    // Fetch product by ID (GET method)
    if (method === "GET") {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.status(200).json(product);
    }

    // Update product (PUT method)
    if (method === "PUT") {
      const { name, wsCode, salesPrice, mrp, packageSize, tags, category, images } = req.body;

      // Validate required fields
      const missingFields = [];
      if (!name) missingFields.push("name");
      if (!wsCode) missingFields.push("wsCode");
      if (!salesPrice) missingFields.push("salesPrice");
      if (!mrp) missingFields.push("mrp");
      if (!tags) missingFields.push("tags");
      if (!category) missingFields.push("category");

      if (missingFields.length > 0) {
        return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
      }

      // Handle image uploads if necessary
      let uploadedImages = [];
      if (images && images.length > 0) {
        try {
          uploadedImages = [];
          for (let i = 0; i < images.length; i++) {
            const uploadedImage = await uploadImage(images[i]); // Image upload function (e.g., Cloudinary)
            uploadedImages.push(uploadedImage.secure_url);
          }
        } catch (error) {
          return res.status(500).json({ message: "Error uploading images", error: error.message });
        }
      }

      // Use the same product update logic as in the admin route
      const updatedProduct = await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
          name,
          wsCode,
          salesPrice,
          mrp,
          packageSize,
          tags,
          category,
          images: uploadedImages.length > 0 ? uploadedImages : undefined, // Update images only if new ones are provided
        },
      });

      return res.status(200).json(updatedProduct);
    }

    // Handle invalid method
    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

// Protect the handler with both authentication and admin middleware
export default authMiddleware(adminMiddleware(handler));
