// prisma/index.js or prisma/prisma.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export { prisma };
