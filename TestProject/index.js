const express = require('express');
const ws = require('ws');

const app = express();

app.use(express.static('public'))

const server = app.listen(8080);

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});

const wsServer = new ws.Server({ noServer: true });

wsServer.on('connection', socket => {
  socket.on('message', message => console.log(message));
});

// Routing

