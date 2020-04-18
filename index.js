const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.post('/game/update', (req, res) => {
	const room = req.body.room;

	io.sockets.in(room).emit('update');
	console.log(`[updt] update on ${room}`);
});

io.on('connection', (socket) => {
	console.log(`[conn] client connected: ${socket.id}`);
	socket.emit('connection');

	socket.on('join', (name, room) => {
		room = room || 'room_list';

		console.log(`[join] user join : ${name}(${socket.id}) to ${room}`);

		// set socket data
		socket.name = name;
		socket.room = room;

		socket.join(socket.room)
		socket.broadcast.to(socket.room).emit('join', socket.name);
	});

	socket.on('chat', (msg) => {
		console.log(`[chat] ${socket.name} : ${msg}`);
		socket.broadcast.to(socket.room).emit('chat', socket.name, msg);
	});

	socket.on('disconnect', () => {
		console.log(`[dscn] client disconnected : ${socket.name}(${socket.id})`);
		if(socket.name){
			io.sockets.in(socket.room).emit('disconnect', socket.name);
		}
	});
});

http.listen(3000, function(){
  console.log('server on!');
});