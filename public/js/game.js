/**
  * This file is for the game.
  */


/**
  * Connect to socket.io
  * @author Jonathan Lam
  */
var socket = io();

// get game id to show on element #gameId
socket.on('gameId', gameId => document.querySelector('#gameId').textContent = gameId);

/**
  * Get errors on joining room
  * @author Jonathan Lam
  */
socket.on('err', msg => {
  document.querySelector('#gameIdContainer').style.display = 'none';
  document.querySelector('#error').textContent = `Error: ${msg}`
});

/**
  * Get name if client
  * @author Jonathan Lam
  */
var isHost = false;
socket.emit('isHost', isHostResponse => {
  if(!isHostResponse) {
    var defaultNames = ['Billy Bob', 'John Doe', 'Sally Kelly', 'Mario', 'Westy'];
    var name = prompt('What is your name?', defaultNames[Math.floor(Math.random() * defaultNames.length)]);
    socket.emit('setName', name);
  }
  isHost = isHostResponse;
});

/**
  * Update name listing
  * @author Jonathan Lam
  */
var namesElement = document.querySelector('#names');
socket.on('updateNames', names => {
  namesElement.innerHTML = '';
  for(var name of names) {
    var nameDiv = document.createElement('div');
    nameDiv.appendChild(document.createTextNode(name || 'An unnamed driver'));
    namesElement.appendChild(nameDiv);
  }
});

/**
  * Terminate game (if host leaves)
  * @author Jonathan Lam
  */
socket.on('terminateGame', () => {
  window.location.href = '/';
});

/**
  * If client, get orientation event and send to server
  * Calculates forward speed from gamma (and beta), turn from beta
  * @author Jonathan Lam
  */
window.addEventListener('deviceorientation', event => {

  // only do this for client
  if(isHost) return;

  var forwardSpeed = 0, turnSpeed = 0;
  // device facing upwards
  if(Math.abs(event.beta) < 90) {
    forwardSpeed = event.gamma;
    turnSpeed = event.beta;
  }
  // device facing downwards -- put at extreme (-90 or 90)
  else {
    forwardSpeed = event.gamma < 0 ? 90 : -90;
    turnSpeed = (event.beta < 0 ? -180 : 180) - event.beta;
  }

  socket.emit('deviceOrientation', forwardSpeed, turnSpeed);

});

/**
  * If host, display positions of all users (for now)
  * @author Jonathan Lam
  */
socket.on('updatedMap', map => {
  // just log map for now
  console.log(map);
});
