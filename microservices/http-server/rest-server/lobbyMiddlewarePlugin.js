exports = module.exports = function(lobbyId,socket) {
  
	var self = this;

	self.lobbyId = lobbyId;
	self.socket = socket;

	console.log('Inside Middleware for Subscribing ' + lobbyId);

	const seneca = require('seneca');

	const lobbyServer = seneca();

	lobbyServer.add('role:lobbySub,lobbyId:'+lobbyId+',cmd:updatePlayerDetails',function(msg, callback) {
	  console.log('----//// Inside Server Middleware for update player ////----');
	  socket.emit('updatePlayer', {data: msg.data});
	  return callback(null,{response: msg.data});
	});

	lobbyServer.add('role:lobbySub,lobbyId:'+lobbyId+',cmd:updateTopicDetails',function(msg, callback) {
	  console.log('----//// Inside Server Middleware for update topic ////----');
	  socket.emit('updateTopic', {data: msg.data});
	  return callback(null,{response: msg.data});
	});

	lobbyServer.add('role:lobbySub,lobbyId:'+lobbyId+',cmd:updateChatDetails',function(msg, callback) {
	  console.log('----//// Inside Server Middleware for update chat ////----');
	  socket.emit('updateChat', {data: msg.data});
	  return callback(null,{response: msg.data});
	});

	lobbyServer.add('role:lobbySub,lobbyId:'+lobbyId+',cmd:unsubscribeToLobby',function(msg, callback) {
	  console.log('----//// Inside Server Middleware for unsubscribing ////----');
	  
	  lobbyServer.close();

	  return callback(null,{response: msg.data});
	});

	lobbyServer.add('role:lobbySub,lobbyId:'+lobbyId+',cmd:lobbyGameStart',function(msg, callback) {
	  console.log('----//// Inside Server Middleware for starting game ////----');
	  socket.emit('startLobbyGame', {data: 'start'});

	  return callback(null,{response: "success"});
	});

	lobbyServer.use('redis-transport');
	lobbyServer.listen({
		type:'redis',
		pin: 'role:lobbySub,lobbyId:'+lobbyId+',cmd:*',
		host:'172.23.238.251'
	});
	console.log('--- subscribed');
}