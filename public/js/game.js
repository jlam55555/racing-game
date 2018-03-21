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

    // overwrite main render function with client one
    overwriteRender();

    // ask for name, send to server
    // dog names courtesy of https://www.care.com/c/stories/6095/101-real-and-funny-dog-names/
    var defaultNames = ["Bark Twain","Chewbarka","Doc McDoggins","Droolius Caesar","Franz Fur-dinand","Fyodor Dogstoevsky","Hairy Paw-ter","Jimmy Chew","Kareem Abdul Ja-Bark","Mary Puppins","The Notorious D.O.G.","Orville Redenbarker","Ozzy Pawsborne","Prince of Barkness","Salvador Dogi","Santa Paws","Sarah Jessica Barker","Sherlock Bones","Winnie the Poodle","Woofgang Puck","Dobby","Elmo","Frodo","Gollum","Khaleesi","Mister Miyagi","Pikachu","Pumba","Rocky","Yoda","Archie","Barney","Betty","Bernadette","Bob","Fergus","Gary","Kevin","Larry","Lloyd","Matilda","Olga","Pam","Rufus","Waldo","Attila","Baloo","Bruiser","Butterball","Chompers","Cujo","Hercules","Jabba","Moose","Rambo","Rex","Tank","Zeus","Binx","Bitsy","Demi","Hobbit","Munchkin","Nugget","Pee Wee","Peanut","Scrappy","Squeakers","Squirt","Toto","Twinkie","Alfalfa","Beans","Biscuit","Butters","Chalupa","Cheeseburger","Fluffernutter","Jellybean","Meatball","Nacho","Noodles","Salsa","Tater","Waffles","Alfred von Wigglebottom","Barkley","Captain Sniffer","Count Droolsbury","Deputy Dawg","Doodle","Lucky Goodsniffer","Miss Furbulous","Mister Fluffers","Professor Wagglesworth","Putt-putt","Scooter","Sergeant Barkowitz","Sir Barks-a-Lot","Sir Waggington","Woofer\n "]
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

  // update cars and cameras
  updateCars();
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
