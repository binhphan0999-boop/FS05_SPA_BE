import { ServiceController } from "@controllers/api/v1/services/service.controller";
import { RailsRoute, RestActions } from "ts-rails";

export class ServiceRoute extends RailsRoute {
  public draw() {
    this.resource(ServiceController, {
      only: [RestActions.Index],
    });
  }
}
