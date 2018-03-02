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

  // handle when a person disconnects
  socket.on('disconnect', () => {
    console.log(`A user with socket id ${socket.id} has disconnected.`);
  });

});

/**
  * Rooms to allow people
  * @author Jonathan Lam
  */
app.get('/game/:gameid', (req, res, next) => {
  // get gameid parameter
  var gameid = req.params.gameid;
  var socket;

  // sync up to socket to join room (keep refreshing until socketId is updated)
  var syncInterval = setInterval(() => req.session.reload(() => {
    if(req.session.socketId !== undefined && (socket = io.sockets.sockets[req.session.socketId]) !== undefined) {
      clearInterval(syncInterval);

      // this code will run when corresponding socket is found
      socket.join(gameid);
      io.to(gameid).emit('message', `testing: you are in room ${gameid}`);
    }
  }), 50);

  res.sendFile(`${__dirname}/public/index.html`);
});

app.use(express.static('public'));
