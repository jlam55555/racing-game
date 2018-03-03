/**
  * This file is for the homepage.
  */

/**
  * Connect to socket.io
  * @author Jonathan Lam
  */
var socket = io();


/**
  * Create a game when button is clicked
  * @author Jonathan Lam
  */
var createGameButton = document.querySelector('#createGame');
createGameButton.addEventListener('click', () => {
  // redirect to page on click
  socket.emit('createNewGame', newGameId => {
    window.location.href = `${window.location.href}game/${newGameId}`;
  });
});


/**
  * Join a room when button is clicked
  * @author Jonathan Lam
  */
var joinGameId = document.querySelector('#joinGameId');
var joinGameButton = document.querySelector('#joinGame');
joinGameButton.addEventListener('click', () => {
  if(joinGameId.value.trim() !== '') {
    window.location.href = `${window.location.href}game/${joinGameId.value}`;
  }
})
