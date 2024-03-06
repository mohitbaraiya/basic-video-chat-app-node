import path from "path";
import { createServer, Server as HTTPServer } from "http";
import express, { Application } from "express";
import { Server as SocketIoServer } from "socket.io";
import morgan from "morgan";

export class Server {
  #httpServer: HTTPServer;
  #app: Application;
  #io: SocketIoServer;
  #activeSockets: string[];
  readonly #port: number = 4000;
  readonly #staticFilesPath = path.join(__dirname, "../public");

  constructor() {
    // app initialization
    this.#app = express();
    this.#httpServer = createServer(this.#app);
    this.#io = new SocketIoServer(this.#httpServer);
    this.#activeSockets = [];

    this.#serveStaticFiles();
    this.#setUpLogging();
    this.#handleRoutes();
    this.#handleSocketConnection();
  }

  //   handle http routes
  #handleRoutes(): void {
    this.#app.get("/", (req, res) => {
      res.send(`<h1>Hello world</h1>`);
    });
  }

  //   handle socket communication
  #handleSocketConnection(): void {
    this.#io.on("connection", (socket) => {
      console.log("connected");

      const socketExists = this.#activeSockets.find(
        (existingSocket) => existingSocket === socket.id
      );

      if (!socketExists) {
        this.#activeSockets.push(socket.id);

        socket.emit("update-user-list", {
          users: this.#activeSockets.filter(
            (socketExists) => socketExists !== socket.id
          ),
        });

        socket.broadcast.emit("update-user-list", {
          users: [socket.id],
        });
      }
      socket.on("disconnect", () => {
        this.#activeSockets = this.#activeSockets.filter(
          (existingSocket) => existingSocket !== socket.id
        );
        socket.broadcast.emit("remove-user", {
          socketId: socket.id,
        });
      });
    });
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
