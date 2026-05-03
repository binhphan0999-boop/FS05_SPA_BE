// import env from "@configs/env";
// import { PrismaClient } from "@db";
// import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
// import fs from "fs";
// import path from "path";

// const prismaClientSingleton = () => {
//   const dbPath = env.databaseUrl.replace(/^file:/, "");
//   const resolvedDbPath = path.resolve(process.cwd(), dbPath);
//   const dbDir = path.dirname(resolvedDbPath);

//   if (!fs.existsSync(dbDir)) {
//     fs.mkdirSync(dbDir, { recursive: true });
//   }

//   const adapter = new PrismaBetterSqlite3({
//     url: resolvedDbPath,
//   });

//   return new PrismaClient({
//     adapter,
//     log: env.nodeEnv === "development" ? ["query", "error", "warn"] : ["error"],
//   });
// };

// type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClientSingleton | undefined;
// };

// const models = globalForPrisma.prisma ?? prismaClientSingleton();

// export default models;

// if (env.nodeEnv !== "production") globalForPrisma.prisma = models;

import env from "@configs/env";
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      env.nodeEnv === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const models = globalForPrisma.prisma ?? prismaClientSingleton();

export default models;

if (env.nodeEnv !== "production") {
  globalForPrisma.prisma = models;
}