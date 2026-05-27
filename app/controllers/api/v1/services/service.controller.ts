import { serviceService } from "@services/services/service.service";
import { ApiV1Controller } from "../apiV1.controller";

export class ServiceController extends ApiV1Controller {
  async index() {
    try {
      const services = await serviceService.getServices();
      this.renderJson(services);
    } catch (error) {
      this.renderJson({ error: (error as any).message }, 500);
    }
  }
}
