import { createServer, Server as HTTPServer } from "http";
import express, { Application } from "express";
import socketIO, { Server as SocketIoServer } from "socket.io";
export class Server {
  #httpServer: HTTPServer;
  #app: Application;
  #io: SocketIoServer;
  readonly #port: number = 4000;

  constructor() {
    this.#initialize();

    this.#handleRoutes();
    this.#handleSocketConnection();
  }

  //   app initialization
  #initialize(): void {
    this.#app = express();
    this.#httpServer = createServer(this.#app);
    this.#io = new SocketIoServer(this.#httpServer);
  }

  //   handle http routes
  #handleRoutes(): void {}

  //   handle socket communication
  #handleSocketConnection(): void {}
}
