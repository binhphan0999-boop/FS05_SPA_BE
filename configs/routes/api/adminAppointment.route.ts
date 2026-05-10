import { AdminAppointmentController } from "@controllers/api";
import { RailsRoute, RestActions } from "ts-rails";

export class AdminAppointmentRoute extends RailsRoute {
  public draw() {
    this.resource(AdminAppointmentController, {
      only: [
        RestActions.Index,
        RestActions.Show,
        RestActions.Create,
        RestActions.Update,
        RestActions.Destroy,
      ],
    });
  }
}