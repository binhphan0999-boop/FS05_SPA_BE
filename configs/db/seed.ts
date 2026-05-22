import models from "@models";
import { seedEcommerce } from "./seeders/ecommerce";
import { seedFeatures } from "./seeders/features";
import { seedNews } from "./seeders/news";
import { seedAdminUser } from "./seeders/seedAdminUser";

async function seed() {
  await seedFeatures();
  await seedAdminUser();
  await seedEcommerce();
  await seedNews();
  console.log("Seed data created successfully!");
}
seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await models.$disconnect();
  });
