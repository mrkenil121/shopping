import { prisma } from "@/prisma/index";

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case "GET":
        await handleGet(req, res);
        break;
      case "POST":
        await handlePost(req, res);
        break;
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("Error in /api/customer/index.js:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// GET: Fetch all customers
async function handleGet(req, res) {
  const { page = 1, pageSize = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);

  const [customers, totalCount] = await Promise.all([
    prisma.customer.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
    prisma.customer.count(),
  ]);

  res.status(200).json({
    customers,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  });
}

// POST: Create a new customer
async function handlePost(req, res) {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Name, email, and phone are required" });
  }

  const newCustomer = await prisma.customer.create({
    data: { name, email, phone },
  });

  res.status(201).json({ message: "Customer created successfully", customer: newCustomer });
}
