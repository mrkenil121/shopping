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


