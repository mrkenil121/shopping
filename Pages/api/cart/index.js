import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = decoded.id;


    switch (req.method) {
      case "GET":
        const cartInclude = {
          cartItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  salesPrice: true,
                },
              },
            },
          },
        };

        let cart = await prisma.cart.findUnique({
          where: { userId: userId },
          include: cartInclude,
        });

        if (!cart) {
          cart = await prisma.cart.create({
            data: { userId },
            include: cartInclude,
          });
        }

        const totalPrice = cart.cartItems.reduce(
          (sum, item) => sum + item.product.salesPrice * item.quantity,
          0
        );

        return res.status(200).json({
          cartItems: cart.cartItems.map((item) => ({
            id: item.id,
            cartId: item.cartId,
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.salesPrice,
            product: {
              id: item.product.id,
              name: item.product.name,
              images: item.product.images,
            },
          })),
          totalPrice,
        });

      case "POST":
        const { productId, quantity } = req.body;

        // Input validation
        if (!productId || typeof productId !== 'number') {
          return res.status(400).json({ message: "Valid product ID is required" });
        }

        // Find or create user's cart
        let userCart = await prisma.cart.findUnique({
          where: { userId },
        });

        if (!userCart) {
          userCart = await prisma.cart.create({
            data: { userId },
          });
        }

        // Check if item exists in cart
        const existingCartItem = await prisma.cartItem.findFirst({
          where: {
            cartId: userCart.id,
            productId,
          },
        });

        // If quantity is 0, remove item from cart
        if (quantity === 0 && existingCartItem) {
          await prisma.cartItem.delete({
            where: {
              id: existingCartItem.id,
            },
          });

          const cartInclude = {
            cartItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                    salesPrice: true,
                  },
                },
              },
            },
          };

          // Return updated cart items
          const updatedCart = await prisma.cart.findUnique({
            where: { userId },
            include: cartInclude,
          });

          return res.status(200).json({
            cartItems: updatedCart.cartItems,
            totalPrice: updatedCart.cartItems.reduce(
              (sum, item) => sum + item.product.salesPrice * item.quantity,
              0
            ),
          });
        }

        // If item exists, update quantity by +1 or -1
        if (existingCartItem) {
          const newQuantity = quantity > existingCartItem.quantity 
            ? existingCartItem.quantity + 1  // Only increment by 1
            : existingCartItem.quantity - 1;  // Only decrement by 1

          if (newQuantity < 1) {
            // Remove item if quantity would be less than 1
            await prisma.cartItem.delete({
              where: {
                id: existingCartItem.id,
              },
            });
          } else {
            // Update quantity
            await prisma.cartItem.update({
              where: {
                id: existingCartItem.id,
              },
              data: {
                quantity: newQuantity,
              },
            });
          }

          const cartInclude = {
            cartItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                    salesPrice: true,
                  },
                },
              },
            },
          };

          // Return updated cart items
          const updatedCart = await prisma.cart.findUnique({
            where: { userId },
            include: cartInclude,
          });

          return res.status(200).json({
            cartItems: updatedCart.cartItems,
            totalPrice: updatedCart.cartItems.reduce(
              (sum, item) => sum + item.product.salesPrice * item.quantity,
              0
            ),
          });
        }

        // If item doesn't exist, check product and add to cart with quantity 1
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: {
            id: true,
            salesPrice: true,
          },
        });

        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }

        // Create new cart item with quantity 1
        const cartItem = await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId,
            price: product.salesPrice,
            quantity: 1,  // Always start with quantity 1 for new items
          },
        });

        // Return updated cart items
        const newCart = await prisma.cart.findUnique({
          where: { userId },
          include: {
            cartItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                    salesPrice: true,
                  },
                },
              },
            },
          },
        });

        return res.status(201).json({
          cartItems: newCart.cartItems,
          totalPrice: newCart.cartItems.reduce(
            (sum, item) => sum + item.product.salesPrice * item.quantity,
            0
          ),
        });

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("Cart API Error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}