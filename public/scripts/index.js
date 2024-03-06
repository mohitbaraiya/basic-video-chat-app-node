navigator.getUserMedia(
  { video: true, audio: true },
  (stream) => {
    const localVideo = document.getElementById("local-video");
    if (localVideo && stream) {
      localVideo.srcObject = stream;
    }
  },
  (error) => console.error(error)
);
import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";

const socket = io.connect();

socket.on("connection", (socket) => {
  const existingSocket = this.activeSockets.find(
    (existingSocket) => existingSocket === socket.id
  );
  console.log({ existingSocket });
  if (!existingSocket) {
    this.activeSockets.push(socket.id);

    socket.emit("update-user-list", {
      users: this.activeSockets.filter(
        (existingSocket) => existingSocket !== socket.id
      ),
    });

    socket.broadcast.emit("update-user-list", {
      users: [socket.id],
    });
  }
});
