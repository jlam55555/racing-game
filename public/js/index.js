/**
  * This file is for the homepage.
  */

/**
  * Connect to socket.io
  * @author Jonathan Lam
  */
var socket = io();

/**
  * Join a room when button is clicked
  * @todo   Add server-side verification before submitting
  * @author Jonathan Lam
  */
var joinGameId = document.querySelector('#joinGameId');
var joinGameButton = document.querySelector('#joinGame');
joinGameButton.addEventListener('click', () => {

  window.location.href = `${window.location.href}game/${joinGameId.value}`;

})
