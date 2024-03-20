import { config } from "dotenv";
import { Server as HTTPServer } from "http";
import { Server as SocketIoServer } from "socket.io";
config();
interface ActiveSockets {
  username: string;
  id: string;
}
export class Socket {
  #io: SocketIoServer;
  #activeSockets: ActiveSockets[];

  constructor(httpServer: HTTPServer) {
    this.#io = new SocketIoServer(httpServer, {
      cors: {
        origin: [
          process.env.SOCKET_CORS_URL || "",
          "https://159b-2405-201-2024-a1f6-e4e6-cb07-bc83-6760.ngrok-free.app",
          "http://192.168.29.46:5173",
        ],
      },
    });
    this.#handleSocketConnection();
    this.#activeSockets = [];
  }
  #handleSocketConnection(): void {
    this.#io.on("connection", (socket) => {
      console.log("connected");

      socket.on("add-user", ({ username, id }) => {
        const socketExists = this.#activeSockets.find(
          (existingSocket) => existingSocket.id === id
        );
        if (!socketExists) {
          this.#activeSockets.push({ id: id, username: username });
        }
        console.log(this.#activeSockets);
        socket.emit("new-user-add");
        this.#io.emit("update-user-list", {
          users: this.#activeSockets,
        });
      });

      socket.on("call-user", (data) => {
        console.log(
          "call for ",
          this.#activeSockets.find((active) => active.id === data.to)?.username,
          " from " +
            this.#activeSockets.find((active) => active.id === socket.id)
              ?.username
        );

        socket.to(data.to).emit("call-made", {
          offer: data.offer,
          socket: socket.id,
        });
      });

      socket.on("make-answer", (data) => {
        console.log(
          "make answer for ",
          this.#activeSockets.find((active) => active.id === data.to)?.username,
          " from " +
            this.#activeSockets.find((active) => active.id === socket.id)
              ?.username
        );
        socket.to(data.to).emit("answer-made", {
          socket: socket.id,
          answer: data.answer,
        });
      });

      socket.on("disconnect", () => {
        console.log(
          "user disconnect ",
          this.#activeSockets.find((active) => active.id === socket.id)
            ?.username
        );
        this.#activeSockets = this.#activeSockets.filter(
          (existingSocket) => existingSocket.id !== socket.id
        );
        socket.broadcast.emit("remove-user", {
          socketId: socket.id,
        });
      });
    });
  }
}
