import path from "path";
import { createServer, Server as HTTPServer } from "http";
import express, { Application } from "express";
import { Server as SocketIoServer } from "socket.io";
import morgan from "morgan";

interface ActiveSockets {
  username: string;
  id: string;
}
export class Server {
  #httpServer: HTTPServer;
  #app: Application;
  #io: SocketIoServer;
  #activeSockets: ActiveSockets[];
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

      socket.on("add-user", ({ username, id }) => {
        console.log(username);

        const socketExists = this.#activeSockets.find(
          (existingSocket) => existingSocket.id === id
        );
        if (!socketExists) {
          this.#activeSockets.push({ id: id, username: username });

          socket.emit("update-user-list", {
            users: this.#activeSockets,
          });
        }
      });

      socket.on("call-user", (data) => {
        socket.to(data.to).emit("call-made", {
          offer: data.offer,
          socket: socket.id,
        });
      });

      socket.on("make-answer", (data) => {
        socket.to(data.to).emit("answer-made", {
          socket: socket.id,
          answer: data.answer,
        });
      });

      socket.on("disconnect", () => {
        this.#activeSockets = this.#activeSockets.filter(
          (existingSocket) => existingSocket.id !== socket.id
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
