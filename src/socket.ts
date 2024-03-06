import { createServer, Server as HTTPServer } from "http";
import { Server as SocketIoServer } from "socket.io";
interface ActiveSockets {
  username: string;
  id: string;
}
export class Socket {
  #io: SocketIoServer;
  #activeSockets: ActiveSockets[];

  constructor(httpServer: HTTPServer) {
    this.#io = new SocketIoServer(httpServer);
    this.#handleSocketConnection();
    this.#activeSockets = [];
  }
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
}
