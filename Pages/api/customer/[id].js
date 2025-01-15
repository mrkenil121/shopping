import { prisma } from "@/prisma/index";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case "GET":
        await handleGet(req, res, id);
        break;
      case "PUT":
        await handlePut(req, res, id);
        break;
      case "DELETE":
        await handleDelete(req, res, id);
        break;
      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("Error in /api/customer/[id].js:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// GET: Fetch a specific customer
async function handleGet(req, res, id) {
  const customer = await prisma.customer.findUnique({
    where: { id: Number(id) },
  });

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  res.status(200).json(customer);
}

// PUT: Update a specific customer
async function handlePut(req, res, id) {
  const { name, email, phone } = req.body;

  const updatedCustomer = await prisma.customer.update({
    where: { id: Number(id) },
    data: { name, email, phone },
  });

  res.status(200).json({ message: "Customer updated successfully", customer: updatedCustomer });
}

// DELETE: Delete a specific customer
async function handleDelete(req, res, id) {
  await prisma.customer.delete({ where: { id: Number(id) } });
  res.status(200).json({ message: "Customer deleted successfully" });
}
