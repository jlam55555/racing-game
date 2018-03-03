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
