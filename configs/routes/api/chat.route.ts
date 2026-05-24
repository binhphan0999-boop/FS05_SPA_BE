import { ChatController } from "@controllers/api";
import { action, RailsRoute } from "ts-rails";

export class ChatRoute extends RailsRoute {
  public draw() {
    this.post(
      "/ask",
      action(ChatController, "ask")
    );
  }
}