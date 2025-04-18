const APP_ID = "36aff9e32e8d4979a99c62128180e621";
const TOKEN =
  "007eJxTYHBT8GM882Rhvu5ByStJKTUTUyfIK78KTWx9dsVtqrVFV6UCg7FZYlqaZaqxUapFiomluWWipWWymZGhkYWhhUEqkOH3hzGjIZCR4UG2LSsjAwSC+GwMxSVFqYm5DAwAFi0ejA==";
const CHANNEL = "stream";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTracks = [];
let remoteUsers = {};

let joinAndDisplayLocalStream = async () => {
  client.on("user-published", handleUserJoined);
  client.on("user-left", handleUserLeft);

  let UID = await client.join(APP_ID, CHANNEL, TOKEN, null);

  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  let player = `<div class="video-container" id="user-container-${UID}">
    <div class="video-player" id="user-${UID}"></div> 
  </div>`;

  document
    .getElementById("video-streams")
    .insertAdjacentHTML("beforeend", player);

  localTracks[1].play(`user-${UID}`);

  await client.publish([localTracks[0], localTracks[1]]);
};

let joinStream = async () => {
  await joinAndDisplayLocalStream();
  document.getElementById("join-btn").style.display = "none";
  document.getElementById("stream-controls").style.display = "flex";
};

let handleUserJoined = async (user, mediaType) => {
  remoteUsers[user.UID] = user;
  await client.subscribe(user, mediaType);

  if (mediaType === "video") {
    let player = document.getElementById(`user-container-${user.uid}`);
    if (player != null) {
      player.remove();
    }

    player = `<div class="video-container" id="user-container-${user.uid}">
      <div class="video-player" id="user-${user.uid}"></div>
    </div>`;

    document
      .getElementById("video-streams")
      .insertAdjacentHTML("beforeend", player);

    user.videoTrack.play(`user-${user.uid}`);
  }
  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  let player = document.getElementById(`user-container-${user.uid}`);
  if (player) {
    player.remove();
  }
};

let leaveAndRemoveLocalStream = async () => {
  for (let i = 0; i < localTracks.length; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }

  await client.leave();
  document.getElementById("join-btn").style.display = "block";
  document.getElementById("stream-controls").style.display = "none";
  document.getElementById("video-streams").innerHTML = "";
};

let toggleMic = async () => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    document.getElementById("mic-btn").innerHTML = "Mic on";
    document.getElementById("mic-btn").style.backgroundColor = 'cadetblue';
  } else {
    await localTracks[0].setMuted(true);
    document.getElementById("mic-btn").innerHTML = "Mic off";
    document.getElementById("mic-btn").style.backgroundColor =  '#EE4B2B'
  }
};

let toggleVideo = async () => {
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    document.getElementById("video-btn").innerHTML = "Camera on";
    document.getElementById("video-btn").style.backgroundColor = 'cadetblue';
  } else {
    await localTracks[1].setMuted(true);
    document.getElementById("video-btn").innerHTML = "Camera off";
    document.getElementById("video-btn").style.backgroundColor =  '#EE4B2B'
  }
};

document.getElementById("join-btn").addEventListener("click", joinStream);
document
  .getElementById("leave-btn")
  .addEventListener("click", leaveAndRemoveLocalStream);
document.getElementById("mic-btn").addEventListener("click", toggleMic);
document.getElementById("video-btn").addEventListener("click", toggleVideo);
