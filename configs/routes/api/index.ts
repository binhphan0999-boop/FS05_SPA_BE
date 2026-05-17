import { ApiResponse, RailsRoute } from "ts-rails";
import { AdminAppointmentRoute } from "./adminAppointment.route";
import { ApiV1Route } from "./v1";

import { AuthRoute } from "./auth.route";
import { UserRoute } from "./user.route";

// export class ApiRoute extends RailsRoute {
//   public draw() {
//     this.get(
//       "/health",
//       async (_req, res) => {
//         const { checkReadiness } = await import("@configs/plugins");
//         const status = await checkReadiness();
//         const code = status.status === "ok" ? 200 : 503;
//         res.status(code).json(ApiResponse.ok(status));
//       },
//       {
//         document: { tags: ["System"] },
//       },
//     );

//     this.path("/v1", ApiV1Route.draw());
//     this.path("/admin/appointments", AdminAppointmentRoute.draw());
//   }
// }

export class ApiRoute extends RailsRoute {
  public draw() {
    this.get(
      "/health",
      async (_req, res) => {
        const { checkReadiness } = await import("@configs/plugins");
        const status = await checkReadiness();
        const code = status.status === "ok" ? 200 : 503;
        res.status(code).json(ApiResponse.ok(status));
      },
      {
        document: { tags: ["System"] },
      },
    );

    this.path("/v1", ApiV1Route.draw());
    this.path("/admin/appointments", AdminAppointmentRoute.draw());

    // ADD THIS
    this.path("/users", UserRoute.draw());
    this.path("/auth", AuthRoute.draw());
  }
}