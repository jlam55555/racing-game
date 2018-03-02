/*
  * Basic app routing using express
  * @author Jonathan Lam
  */

// express and http packages for basic routing
var express = require('express');
var app = express();
var http = require('http').Server(app);

// statically serve files in the public directory as root
app.use(express.static('public'));

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

// callback to listen for io events
io.on('connection', socket => {
  
  // handle when a person connects
  console.log(`A user with socket id ${socket.id} has connected.`);

  // handle when a person disconnects
  socket.on('disconnect', () => {
    console.log(`A user with socket id ${socket.id} has disconnected.);
  });

});
