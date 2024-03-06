import { Server } from "./server";
import { Socket } from "./socket";

const server = new Server();

server.listen((port: number): void => {
  console.log("server listening on port http://localhost:" + port);
});
