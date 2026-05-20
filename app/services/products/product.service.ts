import models from "@models";

const prisma = models;

export class ProductService {
  async getProducts() {
    return await prisma.product.findMany({
      include: {
        category: true,
      },
    });
  }
}

export const productService = new ProductService();
