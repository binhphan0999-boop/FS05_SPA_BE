// import { ApiAuthController } from "@controllers/api";
// import { RailsRoute, RestActions } from "ts-rails";

// export class AuthRoute extends RailsRoute {
//   public draw() {
//     this.resource(ApiAuthController, {
//       only: [RestActions.Create],
//     });
//   }
// }

import { ApiAuthController } from "@controllers/api";

import {
  RailsRoute,
  RestActions,
} from "ts-rails";

export class AuthRoute
extends RailsRoute {
    public draw() {
        this.resource(
            ApiAuthController,
            {
                only: [
                    RestActions.Create,
                    RestActions.Destroy,
                ],
            }
        );
    }
}