import { prisma } from "@/prisma/index"; // Adjust the path based on your project structure
import { authMiddleware } from "@/middlewares/authMiddleware";
import { adminMiddleware } from "@/middlewares/adminMiddleware";

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
          images,
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
