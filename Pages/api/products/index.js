import { prisma } from "@/prisma/index";

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case "GET":
        await handleGet(req, res);
        break;
      default:
        res.setHeader("Allow", ["GET"]);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("Error in /products/index.js:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

// GET: Fetch all products with pagination
async function handleGet(req, res) {
  const { page = 1, pageSize = 10 } = req.query;

  // Validate pagination
  const pageNumber = Math.max(1, parseInt(page, 10));
  const pageSizeNumber = Math.max(1, parseInt(pageSize, 10));

  const skip = (pageNumber - 1) * pageSizeNumber;
  const take = pageSizeNumber;

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count(),
  ]);

  res.status(200).json({
    products,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSizeNumber),
  });
}
