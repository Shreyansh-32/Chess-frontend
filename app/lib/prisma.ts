// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Add prisma to the NodeJS global type
// This is to prevent multiple instances of PrismaClient in development
// (hot-reloading can cause this)
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, store the PrismaClient on the global object
  // to avoid creating new instances on hot reloads
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;