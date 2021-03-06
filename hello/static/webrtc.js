var firebaseConfig = {
  apiKey: "AIzaSyBGHOzztkqVzDC0yXXgwjaNJnLBtVFTDzI",
  authDomain: "webrtc-db18c.firebaseapp.com",
  databaseURL: "https://webrtc-db18c.firebaseio.com",
  projectId: "webrtc-db18c",
  storageBucket: "webrtc-db18c.appspot.com",
  messagingSenderId: "635928609520",
  appId: "1:635928609520:web:ee73d17b5f735ff75fb835",
  measurementId: "G-JF27PFWMTS"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

let peerConnection = null;
let roomId = null;
let myName = null;
let peerName = null;

var myVideo = document.getElementById("myVideo");
var peerVideo = document.getElementById("peerVideo");

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]
    }
  ],
  iceCandidatePoolSize: 10
};

function init() {
  document.getElementById("testbtn").addEventListener("click", createRoom);
  roomId = document.getElementById("roomId").nodeValue;
  myName = document.getElementById("myName").nodeValue;
  peerName = document.getElementById("myName").nodeValue;
}

async function createRoom() {
  peerConnection = new RTCPeerConnection(configuration);
  console.log(peerConnection);

  const db = firebase.firestore();

  var offer = await peerConnection.createOffer();

  await peerConnection
    .setLocalDescription(offer)
    .then(value => console.log("set local des"));

  var offerData = {
    offer: {
      type: offer.type,
      sdp: offer.sdp
    }
  };

  var ref = db.collection("rooms").doc(`${roomId}`);
  ref.set(offerData);

  peerConnection.addEventListener("icecandidate", event => {
    if (event.candidate) {
      console.log("icecandidate on");
      console.log(event.candidate);
      const json = event.candidate.toJSON();
      var ref = db.collection("users").doc("teacher");
      ref.set(json);
    }
  });

  db.collection("users")
    .doc(`${peerName}`)
    .onSnapshot(snapshot => {
      if (snapshot.data() != null) {
        const candidate = new RTCIceCandidate(snapshot.data());
        peerConnection.addIceCandidate(candidate);
      }
    });

  db.collection("rooms")
    .doc(`${roomId}`)
    .onSnapshot(async snapshot => {
      console.log("got updated room:", snapshot.data());
      const data = snapshot.data();
      if (!peerConnection.curentRemoteDescription && data.answer) {
        console.log("set remote description: ", data.answer);
        const answer = new RTCSessionDescription(data.answer);
        await peerConnection.setRemoteDescription(answer);
      }
    });
}

async function joinRoom() {}

async function hangUp() {}
init();
