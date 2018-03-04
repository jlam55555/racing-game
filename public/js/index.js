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


/**
  * Make recommendation
  * @author Jonathan Lam
  */
// if large window size or deviceorientationevent not supported, recommend host
if(window.innerWidth >= 1920 || !window.DeviceOrientationEvent) {
  document.querySelector('#desktopRecommendation').style.display = 'block';
}
// else recommend client
// this double-checks if deviceorientationevent works (and if it doesn't, recommends desktop)
else {
  if(window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', event => {
      if(event.alpha === null) {
        document.querySelector('#desktopRecommendation').style.display = 'block';
      } else {
        document.querySelector('#mobileRecommendation').style.display = 'block';
      }
    });
  } else {
    document.querySelector('#mobileRecommendation').style.display = 'block';
  }
}
