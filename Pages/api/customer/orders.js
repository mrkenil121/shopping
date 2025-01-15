import { prisma } from "@/prisma/index";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }

    const { customerId, page = 1, pageSize = 10 } = req.query;

    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: Number(customerId) },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.order.count({ where: { customerId: Number(customerId) } }),
    ]);

    res.status(200).json({
      orders,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    console.error("Error in /api/customer/orders.js:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
