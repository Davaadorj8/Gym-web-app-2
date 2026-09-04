import { PrismaClient } from '@prisma/client';

let prismaInstance: unknown;

const noOp = {
  findMany: async () => [],
  findFirst: async () => null,
  findUnique: async () => null,
  create: async (d: unknown) => (d as { data?: unknown })?.data ?? {},
  update: async (d: unknown) => (d as { data?: unknown })?.data ?? {},
  delete: async () => ({}),
  count: async () => 0,
  upsert: async (d: unknown) => (d as { create?: unknown })?.create ?? {},
};

try {
  if (process.env.DATABASE_URL) {
    prismaInstance = new PrismaClient();
  } else {
    console.warn('[AI Studio] DATABASE_URL not set — using in-memory mock proxy');
    prismaInstance = new Proxy({} as object, {
      get: () => new Proxy({}, { get: () => async () => null }),
    });
  }
} catch {
  console.warn('[AI Studio] Database not connected — using mock');
  prismaInstance = new Proxy({} as object, {
    get: () => noOp,
  });
}

export const prisma = prismaInstance as PrismaClient;
export default prisma;

