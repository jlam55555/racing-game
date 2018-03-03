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
socket.emit('isHost', isHost => {
  if(!isHost) {
    var defaultNames = ['Billy Bob', 'John Doe', 'Sally Kelly', 'Mario', 'Westy'];
    var name = prompt('What is your name?', defaultNames[Math.floor(Math.random() * defaultNames.length)]);
    socket.emit('setName', name);
  }
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
