const express = require("express");
const app = express();
const wss = require("express-ws")(app);
const aWss = wss.getWss();

let users = [];
let sockets = [];

app.ws("/", (ws, req) => {
	console.log("connection");
	ws.on("message", (msg) => {
		msg = JSON.parse(msg);
		console.log(msg);
		switch (msg.method) {
			case "connection":
				connectionHandler(ws, msg);
				break;
			case "pin":
        let currentUser = users.filter(user => user.userId === msg.userId)[0];
        currentUser.coordinates = {x: Number(msg.x), y: Number(msg.y)};
				currentUser.pinShown = true;
				console.log(users);
				broadcastHandler(ws, msg);
				break;
			case 'mapChange':
				users.forEach(user => user.pinShown = false);
				console.log(users);
				broadcastHandler(ws, msg);
				break;
		}
	});
	ws.on('close', (req) => {
		const disconnectedSocketIndex = sockets.indexOf(ws);
		const disconnectedUserIndex = users.findIndex(user => user.userId === sockets[disconnectedSocketIndex].userId);
		const disconnectedUser = users[disconnectedUserIndex];
		const msg = {id: disconnectedUser.id, users: users, method: 'disconnect'};
		sockets.splice(disconnectedSocketIndex, 1);
		users.splice(disconnectedUserIndex, 1);
		console.log(disconnectedSocketIndex, disconnectedUserIndex, users);
		broadcastHandler(ws, msg);
	})
});

function connectionHandler(ws, msg) {
	ws.id = msg.id;
	ws.userId = msg.userId;
	sockets.push(ws);
  users.push({id: msg.id, userId: msg.userId, username: msg.username, pinShown: msg.pinShown, coordinates: {x: 0, y: 0}});
	broadcastHandler(ws, msg);
}

function broadcastHandler(ws, msg) {
	aWss.clients.forEach((client) => {
		console.log(client.id);
		if (client.id === msg.id) {
      if (msg.method === 'connection' || msg.method === 'mapChange') {
        client.send(JSON.stringify({...msg, users: users}));
      } else {
        client.send(JSON.stringify(msg));
      }
			
		}
	});
}

app.listen(5000, () => console.log("started"));
