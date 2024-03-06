import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";

let isAlreadyCalling = false;
const username = prompt("Enter your full name: ");
// let getCalled = false;

// const existingCalls = [];

const { RTCPeerConnection, RTCSessionDescription } = window;

const peerConnection = new RTCPeerConnection();
const usermediaParams = { video: true, audio };
function userMediaListener(stream) {
  const localVideo = document.getElementById("local-video");
  if (localVideo && stream) {
    localVideo.srcObject = stream;
    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));
  }
}
function usermediaErrorHandler() {
  console.error(error);
}
let getMediaFunction = "getUserMedia";
if (typeof navigator?.mozGetUserMedia === "function") {
  getMediaFunction = "mozGetUserMedia";
} else if (typeof navigator?.webkitGetUserMedia === "function") {
  getMediaFunction = webkitGetUserMedia;
}
navigator[getMediaFunction](
  usermediaParams,
  userMediaListener,
  usermediaErrorHandler
);

function unselectUsersFromList() {
  const alreadySelectedUser = document.querySelectorAll(
    ".active-user.active-user--selected"
  );

  alreadySelectedUser.forEach((el) => {
    el.setAttribute("class", "active-user");
  });
}

peerConnection.ontrack = function ({ streams: [stream] }) {
  const remoteVideo = document.getElementById("remote-video");
  if (remoteVideo) {
    remoteVideo.srcObject = stream;
  }
};

async function callUser(socketId) {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

  socket.emit("call-user", {
    offer,
    to: socketId,
  });
}
function createUserItemContainer(socketId, username) {
  const userContainerEl = document.createElement("div");

  const usernameEl = document.createElement("p");

  userContainerEl.setAttribute("class", "active-user");
  userContainerEl.setAttribute("id", socketId);
  usernameEl.setAttribute("class", "username");
  usernameEl.innerHTML = `Username: ${username} <br/> Socket: ${socketId}`;

  userContainerEl.appendChild(usernameEl);

  userContainerEl.addEventListener("click", () => {
    unselectUsersFromList();
    userContainerEl.setAttribute("class", "active-user active-user--selected");
    const talkingWithInfo = document.getElementById("talking-with-info");
    talkingWithInfo.innerHTML = `Talking with: "Socket: ${socketId}"`;
    callUser(socketId);
  });
  return userContainerEl;
}
function updateUserList(socketIds) {
  const activeUserContainer = document.getElementById("active-user-container");

  socketIds.forEach(({ username, id: socketId }) => {
    const alreadyExistingUser = document.getElementById(socketId);
    if (!alreadyExistingUser) {
      const userContainerEl = createUserItemContainer(socketId, username);
      activeUserContainer.appendChild(userContainerEl);
    }
  });
}

// socket code
const socket = io.connect();
socket.on("connect", () => {
  socket.emit("add-user", { username, id: socket.id });
  socket.on("update-user-list", ({ users }) => {
    console.log(users);
    updateUserList(users.filter((user) => user.id !== socket.id));
  });
  socket.on("remove-user", ({ socketId }) => {
    const elToRemove = document.getElementById(socketId);

    if (elToRemove) {
      elToRemove.remove();
    }
  });

  socket.on("call-made", async (data) => {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

    socket.emit("make-answer", {
      answer,
      to: data.socket,
    });
  });

  socket.on("answer-made", async (data) => {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );

    if (!isAlreadyCalling) {
      callUser(data.socket);
      isAlreadyCalling = true;
    }
  });
});
