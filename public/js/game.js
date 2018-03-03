/**
  * This file is for the game.
  */


/**
  * Connect to socket.io
  * @author Jonathan Lam
  */
var socket = io();

// testing: make sure connected to room
socket.on('message', msg => console.log(msg));
