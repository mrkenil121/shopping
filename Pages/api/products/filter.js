import { prisma } from "@/prisma/index";

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case "GET":
        await handleFilter(req, res);
        break;
      default:
        res.setHeader("Allow", ["GET"]);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("Error in /products/filter.js:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// GET: Filter products by category
async function handleFilter(req, res) {
  const { category } = req.query; // Get the category from the query parameters

  if (category === "") {
    // If category is empty, return all products
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ products });
  }

  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }

  const products = await prisma.product.findMany({
    where: {
      category: category, // Exact category match
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ products });
}

