/**
  * Basic app routing using express
  * @author Jonathan Lam
  */

// express and http packages for basic routing
var express = require('express');
var app = express();
var http = require('http').Server(app);

// set port to environment-defined port or 5000 (default)
http.listen(
  process.env.PORT || 5000,
  () => console.log(`Listening on port ${process.env.PORT || 5000}.`));

/**
  * Get socket.io dependency
  * @author Jonathan Lam
  */

// socket.io for real-time WebSocket communication
var io = require('socket.io')(http);
var session = require('express-session')({
    secret: 'test-secret',
    resave: true,
    saveUninitialized: true
});
app.use(session);
var sharedsession = require('express-socket.io-session');
io.use(sharedsession(session, { autoSave: true }));

// callback to listen for io events
io.on('connection', socket => {

  // handle when a person connects
  console.log(`A user with socket id ${socket.id} has connected.`);

  // sync up to express
  socket.handshake.session.socketId = socket.id;
  socket.handshake.session.save();

  // handle when a person creates a new game
  socket.on('createNewGame', callback => {

    // make sure user is not already in a game
    if(socket.handshake.session.gameId !== undefined) return;

    // generate random id of 20 characters
    var gameIdCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var gameId;
    do {
      gameId = '';
      while(gameId.length < 20) {
        gameId += gameIdCharacters.substr(Math.floor(Math.random() * gameIdCharacters.length), 1);
      }
    } while(Object.keys(rooms).indexOf(gameId) !== -1);

    rooms[gameId] = { host: null, clients: [] };

    callback(gameId);

  });

  // check if user is host
  socket.on('isHost', callback => {
    var hostInterval = setInterval(() => {
      socket.handshake.session.reload(() => {
        if(socket.handshake.session.host !== undefined) {
          clearInterval(hostInterval);
          callback(socket.handshake.session.host === true);
        }
      });
    }, 50);
  });

  // set a user's name
  socket.on('setName', name => {
    // get room, set name
    var room = rooms[socket.handshake.session.gameId];
    room.clients.find(client => client.id === socket.handshake.session.id).name = name;

    // tell sockets to update names
    io.to(socket.handshake.session.gameId).emit('updateNames', room.clients.map(client => client.name));
  });

  // handle when a person disconnects
  socket.on('disconnect', () => {
    console.log(`A user with socket id ${socket.id} has disconnected.`);

    // delete room if host
    if(socket.handshake.session.gameId !== undefined && socket.handshake.session.host === true) {
      // delete room
      var room = rooms[socket.handshake.session.gameId];

      // tell users to go away
      io.to(socket.handshake.session.gameId).emit('terminateGame');
    }

    // delete person if client
    if(socket.handshake.session.gameId !== undefined && socket.handshake.session.host === false) {
      var room = rooms[socket.handshake.session.gameId];
      room.clients = room.clients.filter(client => client.id !== socket.handshake.session.id);

      // update other users
      io.to(socket.handshake.session.gameId).emit('updateNames');
    }

    // also remove from session
    socket.handshake.session.gameId = undefined;
    socket.handshake.session.host = undefined;
    socket.handshake.session.save();
  });

});


/**
  * Rooms to allow people to play multiplayer
  * @todo   add verification that server is created, number of people is less than 3
  * @author Jonathan Lam
  */

var rooms = {};
/* room format: {
  host: [hostId],
  clients: [arrayOfClientIds]
} */

app.get('/game/:gameId', (req, res, next) => {
  // get gameid parameter
  var gameId = req.params.gameId;
  var socket;

  // sync up to socket to join room (keep refreshing until socketId is updated)
  var syncInterval = setInterval(() => req.session.reload(() => {
    if(req.session.socketId !== undefined && (socket = io.sockets.sockets[req.session.socketId]) !== undefined) {
      clearInterval(syncInterval);

      // error 1: room does not exist
      if(Object.keys(rooms).indexOf(gameId) === -1) {
        socket.emit('err', `Game room "${gameId}" does not exist.`);
        return;
      }

      // error 2: room has more than four people in it
      if(rooms[gameId].clients.length > 3) {
        socket.emit('err', `Game room "${gameId}" is already full.`);
        return;
      }

      // error 3: user is already in the game
      if(rooms[gameId].clients.find(client => client.id === req.session.id) !== undefined || rooms[gameId].host === req.session.id) {
        socket.emit('err', 'You are already in this game on another tab.');
        return;
      }

      // add gameId to session, session id to game room
      req.session.gameId = gameId;

      // if first person, then host; if not, then client
      if(rooms[gameId].host === null) {
        rooms[gameId].host = req.session.id;
        req.session.host = true;
      } else {
        rooms[gameId].clients.push({ id: req.session.id, name: null });
        req.session.host = false;
      }
      req.session.save();

      // join game room
      socket.join(gameId);
      socket.emit('gameId', gameId);
      io.to(gameId).emit('updateNames', rooms[gameId].clients.map(client => client.name));
    }
  }), 50);

  res.sendFile(`${__dirname}/public/game.html`);
});

app.use(express.static('public'));
