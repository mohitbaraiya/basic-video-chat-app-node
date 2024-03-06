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
