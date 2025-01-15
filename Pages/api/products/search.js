import { prisma } from "@/prisma/index";

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case "GET":
        await handleSearch(req, res);
        break;
      default:
        res.setHeader("Allow", ["GET"]);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("Error in /products/search.js:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// GET: Search products by name
async function handleSearch(req, res) {
  const { query } = req.query; // Get the search query from the query parameters

  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: query, // Partial matching
        mode: "insensitive", // Case-insensitive search
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ products });
}
