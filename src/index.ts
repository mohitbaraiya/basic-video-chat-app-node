import { Server } from "./server";

const server = new Server();

server.listen((port: number): void => {
  console.log("server listening on port http://localhost:" + port);
});

console.log(global.my);
