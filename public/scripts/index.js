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
