import models from "@models";
import { seedCoupons } from "./seeders/coupon";
import { seedEcommerce } from "./seeders/ecommerce";
import { seedFeatures } from "./seeders/features";
import { seedNews } from "./seeders/news";
import { seedAdminUser } from "./seeders/seedAdminUser";
import { seedServices } from "./seeders/services";

async function seed() {
  await seedFeatures();
  await seedAdminUser();
  await seedEcommerce();
  await seedNews();
<<<<<<< HEAD
  await seedCoupons();
=======
  await seedServices();
>>>>>>> 0880b023fbbc1ed8e81bd9ff1edece48394ad2a3
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
