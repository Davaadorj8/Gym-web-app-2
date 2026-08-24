import { PrismaClient } from '@prisma/client';

let prismaInstance: any;

const noOp = {
  findMany: async () => [],
  findFirst: async () => null,
  findUnique: async () => null,
  create: async (d: any) => d?.data ?? {},
  update: async (d: any) => d?.data ?? {},
  delete: async () => ({}),
  count: async () => 0,
  upsert: async (d: any) => d?.create ?? {},
};

try {
  if (process.env.DATABASE_URL) {
    prismaInstance = new PrismaClient();
  } else {
    console.warn('[AI Studio] DATABASE_URL not set — using in-memory mock proxy');
    prismaInstance = new Proxy({} as any, {
      get: () => new Proxy({}, { get: () => async () => null }),
    });
  }
} catch {
  console.warn('[AI Studio] Database not connected — using mock');
  prismaInstance = new Proxy({} as any, {
    get: () => noOp,
  });
}

export const prisma = prismaInstance as PrismaClient;
export default prisma;

