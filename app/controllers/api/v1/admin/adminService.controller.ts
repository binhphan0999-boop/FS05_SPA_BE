import { serviceService } from "@services/services/service.service";
import {
  CreateServiceValidator,
  UpdateServiceValidator,
} from "@validators/admin.validator";
import { NotFoundError } from "ts-rails";
import { ApiV1Controller } from "../apiV1.controller";

export class ApiV1AdminServiceController extends ApiV1Controller {
  async index() {
    const services = await serviceService.getAllServices();
    this.renderJson(services);
  }

  async show() {
    const service = await serviceService.getServiceById(this.req.params.id);
    if (!service) throw new NotFoundError("Service not found");
    this.renderJson(service);
  }

  async create() {
    const data = await this.params(CreateServiceValidator).permit(
      "name",
      "description",
      "price",
      "durationMinutes",
      "categoryId",
      "imageUrl",
      "isActive",
    );
    const service = await serviceService.createService(data as any);
    this.renderJson(service, 201);
  }

  async update() {
    const id = this.req.params.id;
    const existing = await serviceService.getServiceById(id);
    if (!existing) throw new NotFoundError("Service not found");

    const data = await this.params(UpdateServiceValidator).permit(
      "name",
      "description",
      "price",
      "durationMinutes",
      "categoryId",
      "imageUrl",
      "isActive",
    );
    const service = await serviceService.updateService(id, data as any);
    this.renderJson(service);
  }

  async destroy() {
    const id = this.req.params.id;
    const existing = await serviceService.getServiceById(id);
    if (!existing) throw new NotFoundError("Service not found");

    await serviceService.deleteService(id);
    this.renderJson({ deleted: true });
  }
}
