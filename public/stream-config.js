const Dropdown = require('react-bootstrap')
const broadcastStream = require('../broadcast')
const {getUserStream} = require('../connection')
const adapter = require('webrtc-adapter')
const DetectRTC = require('detectrtc')
const io = require('socket.io')(80, { wsEngine: 'uws' })

const config = {
  openSocket: config => {
    const SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com:443/';
    config.channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
    const sender = Math.round(Math.random() * 999999999) + 999999999;
    io.connect(SIGNALING_SERVER).emit('new-channel', {
      channel: config.channel,
      sender: sender
    });
    const socket = io.connect(SIGNALING_SERVER + config.channel);
    socket.channel = config.channel;
    socket.on('connect', () => {
      console.log('CONNECTING TO SOCKET')
      if(config.callback) config.callback(socket);
    });
    socket.send = message => {
      console.log('SENT MESSAGE:  ', message)
      socket.emit('message', {
        sender: sender,
        data: message
      });
    };
    socket.on('message', config.onmessage);
  },
  onRemoteStream: htmlElement => {
    videosContainer.appendChild(htmlElement);
    rotateInCircle(htmlElement);
  },
  onRoomFound: function(room) {
    const alreadyExist = document.querySelector('button[data-broadcaster="' + room.broadcaster + '"]');
    if(alreadyExist) return;
    if(typeof roomsList === 'undefined') roomsList = document.body;
    const tr = document.createElement('tr');
    tr.innerHTML = '<td><strong>' + room.roomName + '</strong> is broadcasting his media!</td>' +
        '<td><button class="join">Join</button></td>';
    roomsList.appendChild(tr);
    const joinRoomButton = tr.querySelector('.join');
    joinRoomButton.setAttribute('data-broadcaster', room.broadcaster);
    joinRoomButton.setAttribute('data-roomToken', room.broadcaster);
    joinRoomButton.onclick = function() {
      this.disabled = true;
      const broadcaster = this.getAttribute('data-broadcaster');
      const roomToken = this.getAttribute('data-roomToken');
      broadcastUI.joinRoom({
        roomToken: roomToken,
        joinUser: broadcaster
      });
      hideUnnecessaryStuff();
    };
  },
  onNewParticipant: numberOfViewers => {
    document.title = 'Viewers: ' + numberOfViewers;
  },
  onReady: () => {
    console.log('now you can open or join rooms');
  }
};

setupNewBroadcastButtonClickHandler = () => {
  console.log('SETTING UP NEW BROADCAST')
  document.getElementById('broadcast-name').disabled = true;
  document.getElementById('setup-new-broadcast').disabled = true;
  DetectRTC.load(() => {
    captureUserMedia(() => {
      const shared = 'video';
      if(window.option == 'Only Audio') {
        shared = 'audio';
      }
      if(window.option == 'Screen') {
        shared = 'screen';
      }
      broadcastUI.createRoom({
        roomName: (document.getElementById('broadcast-name') || {}).value || 'Anonymous',
        isAudio: shared === 'audio'
      });
    });
    hideUnnecessaryStuff();
  });
}

captureUserMedia = callback => {
  const constraints = null;
  window.option = broadcastingOption ? broadcastingOption.value : '';
  if (option === 'Only Audio') {
    constraints = {
      audio: true,
      video: false
    };
    if(DetectRTC.hasMicrophone !== true) {
      alert('DetectRTC library is unable to find microphone; maybe you denied microphone access once and it is still denied or maybe microphone device is not attached to your system or another app is using same microphone.');
    }
  }
  if(option === 'Screen') {
    const video_constraints = {
      mandatory: {
        chromeMediaSource: 'screen'
      },
      optional: []
    };
    constraints = {
      audio: false,
      video: video_constraints
    };
    if(DetectRTC.isScreenCapturingSupported !== true) {
      alert('DetectRTC library is unable to find screen capturing support. You MUST run chrome with command line flag "chrome --enable-usermedia-screen-capturing"');
    }
  }
  if(option != 'Only Audio' && option != 'Screen' && DetectRTC.hasWebcam !== true) {
    alert('DetectRTC library is unable to find webcam; maybe you denied webcam access once and it is still denied or maybe webcam device is not attached to your system or another app is using same webcam.');
  }
  const htmlElement = document.createElement(option === 'Only Audio' ? 'audio' : 'video');
  htmlElement.muted = true;
  htmlElement.volume = 0;
  try {
    htmlElement.setAttributeNode(document.createAttribute('autoplay'));
    htmlElement.setAttributeNode(document.createAttribute('playsinline'));
    htmlElement.setAttributeNode(document.createAttribute('controls'));
  } catch (e) {
    htmlElement.setAttribute('autoplay', true);
    htmlElement.setAttribute('playsinline', true);
    htmlElement.setAttribute('controls', true);
  }
  const mediaConfig = {
    video: htmlElement,
    onsuccess: stream => {
      config.attachStream = stream;
      
      videosContainer.appendChild(htmlElement);
      rotateInCircle(htmlElement);
      
      callback && callback();
    },
    onerror: function() {
      if(option === 'Only Audio') alert('unable to get access to your microphone');
      else if(option === 'Screen') {
        if(location.protocol === 'http:') alert('Please test this WebRTC experiment on HTTPS.');
        else alert('Screen capturing is either denied or not supported. Are you enabled flag: "Enable screen capture support in getUserMedia"?');
      } else alert('unable to get access to your webcam');
    }
  };
  if(constraints) mediaConfig.constraints = constraints;
  getUserMedia(mediaConfig);
}
const broadcastUI = broadcast(config);

/* UI specific */
const videosContainer = document.getElementById('videos-container') || document.body;
const setupNewBroadcast = document.getElementById('setup-new-broadcast');
const roomsList = document.getElementById('rooms-list');
const broadcastingOption = document.getElementById('broadcasting-option');
if(setupNewBroadcast) setupNewBroadcast.onclick = setupNewBroadcastButtonClickHandler;

hideUnnecessaryStuff = () => {
  const visibleElements = document.getElementsByClassName('visible'),
    length = visibleElements.length;
  for(let i = 0; i < length; i +=1) {
    visibleElements[i].style.display = 'none';
  }
}

rotateInCircle = video => {
  video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
  setTimeout(() => {
    video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
  }, 1000);
} 
