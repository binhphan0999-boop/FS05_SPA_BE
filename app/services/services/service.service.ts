import models from "@models";

const prisma = models;

export class ServiceService {
  async getServices() {
    return await prisma.service.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { name: "asc" },
    });
  }

  async getAllServices() {
    return await prisma.service.findMany({
      include: { category: true },
      orderBy: { name: "asc" },
    });
  }

  async getServiceById(id: string) {
    return await prisma.service.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async createService(data: {
    name: string;
    description?: string;
    price: number;
    durationMinutes: number;
    categoryId?: string;
    imageUrl?: string;
    isActive?: boolean;
  }) {
    return await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        durationMinutes: data.durationMinutes,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl,
        isActive: data.isActive ?? true,
      },
      include: { category: true },
    });
  }

  async updateService(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      durationMinutes?: number;
      categoryId?: string;
      imageUrl?: string;
      isActive?: boolean;
    },
  ) {
    return await prisma.service.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async deleteService(id: string) {
    return await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const serviceService = new ServiceService();
