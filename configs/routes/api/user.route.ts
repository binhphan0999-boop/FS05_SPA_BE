import { UserController } from "@controllers/api";
import { RailsRoute, RestActions } from "ts-rails";

export class UserRoute extends RailsRoute {
  public draw() {
    this.resource(UserController, {
      only: [RestActions.Create],
    });
  }
}