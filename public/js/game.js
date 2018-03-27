/**
  * This file is for the game.
  */


/**
  * Connect to socket.io
  * @author Jonathan Lam
  */
var socket = io();

// get game id to show on element #gameId
socket.on('gameId', gameId => {
  var gameIdText = "";
  var gameIdChars = gameId.split("");
  for(var char of gameIdChars) {
    gameIdText += `<span class='gameIdChar'>${char.toUpperCase()}</span>`;
  }
  document.querySelector('#gameId').innerHTML = gameIdText;
});

/**
  * Get errors on joining room
  * @author Jonathan Lam
  */
socket.on('err', msg => {
  document.querySelector('#gameIdContainer').style.display = 'none';
  document.querySelector('#names').style.display = 'none';
  document.querySelector('#error').textContent = `Error: ${msg}`;
});

/**
  * Get name if client
  * @author Jonathan Lam
  */
var isHost;
var socketId;
socket.emit('isHost', (isHostResponse, socketIdResponse) => {

  if(!isHostResponse) {

    // ask for name, send to server
    // dog names courtesy of https://www.care.com/c/stories/6095/101-real-and-funny-dog-names/
    var defaultNames = ["Bark Twain","Chewbarka","Doc McDoggins","Droolius Caesar","Franz Fur-dinand","Fyodor Dogstoevsky","Hairy Paw-ter","Jimmy Chew","Kareem Abdul Ja-Bark","Mary Puppins","The Notorious D.O.G.","Orville Redenbarker","Ozzy Pawsborne","Prince of Barkness","Salvador Dogi","Santa Paws","Sarah Jessica Barker","Sherlock Bones","Winnie the Poodle","Woofgang Puck","Dobby","Elmo","Frodo","Gollum","Khaleesi","Mister Miyagi","Pikachu","Pumba","Rocky","Yoda","Archie","Barney","Betty","Bernadette","Bob","Fergus","Gary","Kevin","Larry","Lloyd","Matilda","Olga","Pam","Rufus","Waldo","Attila","Baloo","Bruiser","Butterball","Chompers","Cujo","Hercules","Jabba","Moose","Rambo","Rex","Tank","Zeus","Binx","Bitsy","Demi","Hobbit","Munchkin","Nugget","Pee Wee","Peanut","Scrappy","Squeakers","Squirt","Toto","Twinkie","Alfalfa","Beans","Biscuit","Butters","Chalupa","Cheeseburger","Fluffernutter","Jellybean","Meatball","Nacho","Noodles","Salsa","Tater","Waffles","Alfred von Wigglebottom","Barkley","Captain Sniffer","Count Droolsbury","Deputy Dawg","Doodle","Lucky Goodsniffer","Miss Furbulous","Mister Fluffers","Professor Wagglesworth","Putt-putt","Scooter","Sergeant Barkowitz","Sir Barks-a-Lot","Sir Waggington","Woofer\n "]
    var name = prompt('What is your name?', defaultNames[Math.floor(Math.random() * defaultNames.length)]);
    socket.emit('setName', name);

    // set socketId
    socketId = socketIdResponse;

  }

  // set host flag (true if host, false if client)
  isHost = isHostResponse;
});

/**
  * Update name listing
  * @author Jonathan Lam
  */
var namesElement = document.querySelector('#names');
socket.on('updateNames', names => {

  /**
    * Position name on top left of correct screen
    * @author Jonathan Lam
    */
  var positions;
  switch(names.length) {
    // one person joined: full screen
    case 1:
      positions = [ [ 0, 0 ] ];
      break;
    // two people in the game: side by side
    case 2:
      positions = [ [ 0, 0 ], [ width/2, 0 ] ];
      break;
    // three people in the game: top two side by side, bottom in center
    case 3:
      positions = [ [ 0, 0 ], [ width/2, 0 ], [ width/4, height/2 ] ];
      break;
    // four people in the game: top two side by side, bottom two side by side
    case 4:
      positions = [ [ 0, 0 ], [ width/2, 0 ], [ 0, height/2 ], [ width/2, height/2 ] ];
      break;
    // nobody joined; no positions
    case 0:
    default:
      break;
  }

  var namesElement = document.querySelector('#names');
  namesElement.innerHTML = '';
  for(var i = 0; i < names.length; i++) {
    var nameDiv = document.createElement('div');
    nameDiv.classList.add('name');
    nameDiv.style.left = positions[i][0] + 40 + 'px'; // added padding 40px
    nameDiv.style.top = positions[i][1] + 40 + document.querySelector('#controls').clientHeight + 'px';  // added padding 40px plus height of controls
    nameDiv.appendChild(document.createTextNode(names[i] || 'An unnamed driver'));
    namesElement.appendChild(nameDiv);
  }

  // update cars and cameras
  updateCars();

  // if client
  if(isHost !== undefined && !isHost) {

    // overwrite main render function with client one
    overwriteRender(socketId);

    // add .mobile class to controls to transform it
    document.querySelector('#controls').classList.add('mobile');

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

  // send in deviceorientation
  // comment this for testing on desktop
  socket.emit('deviceOrientation', forwardSpeed, turnSpeed);

});
// uncomment this for testing on desktop
// setTimeout( () => socket.emit('deviceOrientation', 10, 50), 1000 );

/**
  * Get all client positions
  * Host will show all
  * Client will show view from just their car
  * @author Jonathan Lam
  */
socket.on('updatedMap', mapData => {
  map = mapData;
});
