import path from "path";
import { createServer, Server as HTTPServer } from "http";
import express, { Application } from "express";
import morgan from "morgan";
import { Socket } from "./socket";
import { BaseRouter } from "./routes";

export class Server {
  #httpServer: HTTPServer;
  #app: Application;
  readonly #port: number = 4000;
  readonly #staticFilesPath = path.join(__dirname, "../public");

  constructor() {
    // app initialization
    this.#app = express();
    this.#httpServer = createServer(this.#app);

    this.#handleSocketConnection();
    this.#serverConfig();
  }

  //   handle http routes
  #handleRoutes(): void {
    this.#app.use(new BaseRouter().router);
  }

  //   handle socket communication
  #handleSocketConnection(): void {
    new Socket(this.#httpServer);
  }

  //   server configuration
  #serverConfig() {
    this.#serveStaticFiles();
    this.#setUpLogging();
    this.#handleRoutes();
  }
  // serve static files
  #serveStaticFiles(): void {
    this.#app.use(express.static(this.#staticFilesPath));
  }

  //   setup logging in server
  #setUpLogging(): void {
    this.#app.use(morgan("tiny"));
  }
  listen(callback: (port: number) => void): void {
    this.#httpServer.listen(this.#port, callback.bind(null, this.#port));
  }
}
