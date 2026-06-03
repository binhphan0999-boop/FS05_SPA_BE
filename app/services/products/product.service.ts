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

  async getProductsByCategory(categoryId: string) {
    return await prisma.product.findMany({
      where: {
        categoryId,
        status: "ACTIVE",
      },
      include: {
        category: true,
      },
    });
  }

  async getProductById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async searchProducts(query: string, limit: number = 10) {
    return await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ],
        status: "ACTIVE",
      },
      include: {
        category: true,
      },
      take: limit,
    });
  }

  async getProductBySku(sku: string) {
    return await prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
      },
    });
  }

  async getLowStockProducts(threshold: number = 10) {
    return await prisma.product.findMany({
      where: {
        stock: { lte: threshold },
        status: "ACTIVE",
      },
      include: {
        category: true,
      },
      orderBy: { stock: "asc" },
    });
  }

  async getActiveProducts() {
    return await prisma.product.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        category: true,
      },
      orderBy: { name: "asc" },
    });
  }
}

export const productService = new ProductService();
