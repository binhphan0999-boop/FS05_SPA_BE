import env from "@configs/env";
import { PrismaClient } from "@db";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString: env.databaseUrl });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: env.nodeEnv === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const models = globalForPrisma.prisma ?? prismaClientSingleton();

export default models;

if (env.nodeEnv !== "production") globalForPrisma.prisma = models;
