module.exports = function(){

	var seneca = require('seneca');
	var lobby = {};
	var lobbyAll = {};
	var lobbyClient = seneca();

	var mesh = seneca({log: 'test'});
	mesh.use('mesh',{auto:true});

	this.add('role:lobby,action:createLobbyId', function(msg, respond) {
		console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
		console.log('-----------Inside Lobby MicroService---------');
		// console.log(msg);
		var d = new Date();
		console.log('User Id : ' + msg.data);
		console.log('Game Id generated : ' + Number(d));
		var resp = Number(d) + '';
		console.log('---------------------------------------------');

		lobbyClient.use('redis-transport');

	    lobbyClient.client({
	      type: 'redis',
	      pin: 'role:lobbySub,lobbyId:'+resp+',cmd:*',
	      host: '172.23.238.251'
	    });
 
		return respond(null, {gameId: resp});	
	});

	this.add('role:lobby,action:addLobbyDetails', function(msg, respond) {
		console.log('-----------Inside Lobby MicroService---------');
		// console.log(msg);
		console.log('Lobby Id : ' + msg.data.lobby);
		lobby = {};
		lobby.id = msg.data.lobby;
		lobby.playerCount = 1;
		lobby.topic = '';
		lobby.admin = msg.data.player;
		lobby.lobbyStatus = 'open';
		// lobby.admin = 'demoPlayer@demo.com';
		lobby.players = [{
			name: msg.data.player,
			status: 'active',
			user: 'admin'
		}];
		lobby.chat = [];

		lobbyAll[msg.data.lobby] = lobby;

		console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
		console.log(lobbyAll);
		console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
		console.log('---------------------------------------------');
		return respond(null, {gameId: 'success'});
	});

	this.add('role:lobby,action:getAllDetails', function(msg, respond) {
		console.log('-----------Inside Lobby MicroService---------');
		// console.log(msg);
		console.log('Fetching details for Lobby : ' + msg.data.lobbyId);
		if(lobbyAll[msg.data.lobbyId])
		{
			lobby = {};
			lobby = lobbyAll[msg.data.lobbyId];
			console.log(lobby);

			if(lobby.lobbyStatus == 'open')
			{
				console.log('---------------------------------------------');
				return respond(null, {lobby: lobby});
			}
			else
			{
				console.log('Lobby Status is Clossed!');
				return respond(null, {lobby: "invalid"});
			}
		}
		else
		{
			console.log('Lobby not Found!');
			return respond(null, {lobby: "invalid"});	
		}
	});

	this.add('role:lobby,action:addPlayer', function(msg, respond) {
		console.log('((((((((((((((((((((((()))))))))))))))))))))))))');
		console.log('-----------Inside Lobby MicroService---------');
		console.log('Add Player triggered for ' + msg.data.player + 'in Lobby ' + msg.data.lobby);

		lobby = {};
		lobby = lobbyAll[msg.data.lobby];
		console.log('/////////////////////////////////////////////');
		console.log(lobby.players);
		var playr = {
			'name': msg.data.player,
			'status': 'waiting for player',
			'user': 'player'
		};
		lobby.players.push(playr);

		lobbyAll[msg.data.lobby] = lobby;
		console.log('/////////////////////////////////////////////');
		console.log('lobby :');
		console.log(lobbyAll[msg.data.lobby]);
		console.log('/////////////////////////////////////////////');
		console.log('---------------------------------------------');
		
		// lobbyClient.act('role:lobbySub,lobbyId:'+msg.data.lobby+',cmd:updatePlayerDetails', {data: lobby.players}, function(err, response) {
  //         console.log('Response from Middleware : ');
  //         console.log(response);
  //       });
		sendPlayers(msg.data.lobby, lobby.players);

		return respond(null, {players: lobby.players});
	});

	this.add('role:lobby,action:startGame', function(msg, respond) {
		console.log('-----------Inside Lobby MicroService---------');
		console.log('Start Game for Lobby ' + msg.lobby);

		lobby = {};
		lobby = lobbyAll[msg.lobby];

		var dataToPass = {
			lobby: msg.lobby,
			players: lobby.players,
			topic: lobby.topic
		};

		console.log(dataToPass);

		mesh.act('role:provisioner,cmd:startGame', {data: dataToPass}, function(msg,respond){
			console.log('Start Game in Lobby------------------------------');
			console.log(respond);
	    	// return respond(null, {response: 'game started'});
		});

		return respond(null, {players: "Connected with Lobby Microservice"});
	});

	this.add('role:lobby,action:remPlayer', function(msg, respond) {
		console.log('-----------Inside Lobby MicroService---------');
		console.log('Remove Player triggered for ' + msg.data.player);

		lobby = {};
		lobby = lobbyAll[msg.data.lobby];

		var indexToDelete = -1;
		lobby.players.map(function (row, i){
			if(row.name == msg.data.player)
			{
				indexToDelete = i;
				return;
			}			
		});

		console.log('Index to Delete = ' + indexToDelete);
		console.log('User Deleted : ' + lobby.players.name);
		lobby.players.splice(indexToDelete, 1);

		lobbyAll[msg.data.lobby] = lobby;

		console.log('lobby :');
		console.log(lobbyAll[msg.data.lobby]);
		console.log('---------------------------------------------');
		
		sendPlayers(msg.data.lobby, lobby.players);
		
		return respond(null, {players: lobby.players});
	});

	this.add('role:lobby,action:changeTop', function(msg, respond) {
		console.log('-----------Inside Lobby MicroService---------');
		console.log('New Topic Received ' + msg.data.topic);
		console.log('Lobby Id ' + msg.data.lobby);

		lobby = {};
		lobby = lobbyAll[msg.data.lobby];
		lobby.topic = msg.data.topic;
		lobbyAll[msg.data.lobby] = lobby;
		// sendPlayers(msg.data.lobbyId, lobby.players);
		sendTopic(msg.data.lobby, msg.data.topic);

		return respond(null, {response: lobby});
		console.log('---------------------------------------------');
	});

	this.add('role:lobby,action:chatNewMessage', function(msg, respond) {
		console.log('-----------Inside Lobby MicroService---------');
		console.log('New message received from ' + msg.data.name);
		console.log('Message : ' + msg.data.msg);

		lobby = {};
		lobby = lobbyAll[msg.data.lobby];

		var chat = {
			name: msg.data.name,
			msg: msg.data.msg
		}

		lobby.chat.push(chat);

		sendChat(msg.data.lobby, lobby.chat);

		lobbyAll[msg.data.lobby] = lobby;
		console.log(lobby);
		return respond(null, {response: lobby});
		console.log('---------------------------------------------');
	});

	this.add('role:lobby,action:setActive', function(msg, respond) {
		console.log('-----------Inside Lobby MicroService---------');
		console.log('Set Active triggered for ' + msg.data.username);
		console.log('Lobby Id ' + msg.data.lobbyId);

		if(lobbyAll[msg.data.lobbyId] != undefined)
		{
			lobby = {};
			lobby = lobbyAll[msg.data.lobbyId];

			if(lobby.admin != msg.data.username)
			{
				var found = false;
				lobby.players.map(function (row, i){
					if(row.name == msg.data.username)
					{
						found = true;
						row.status = 'active';
						return;
					}			
				});

				if(found)
					console.log('Player allowed..');
				else
					console.log('Player not allowed..');

				sendPlayers(msg.data.lobbyId, lobby.players);
			}

			return respond(null, {response: lobby});
		}
		else
		{
			return respond(null, {response: "error"});	
		}
		console.log('---------------------------------------------');
	});

	this.add('role:lobby,action:setLobbyPlayerLeft', function(msg, respond) {
		console.log('-----------Inside Lobby MicroService---------');
		console.log(msg.data.player + ' Leaving from Lobby ' + msg.data.lobby);

		lobby = {};
		lobby = lobbyAll[msg.data.lobby];

		console.log(lobby);
		if(lobby.admin != msg.data.player)
		{
			lobby.players.map(function (row, i){
				if(row.name == msg.data.player)
				{
					row.status = 'player left';
					return;
				}			
			});
			
			console.log('Removed');
		}
		else
		{
			lobby.players = [];
			lobby.lobbyStatus = 'close';
		}

		sendPlayers(msg.data.lobby, lobby.players);

		lobbyAll[msg.data.lobby] = lobby;

		return respond(null, {response: lobby});
	});



	//***********************Reject****************************


   this.add('role:lobby,action:playerRejected', function(msg, respond) {
		console.log('-----------Inside Lobby MicroService---------');
		console.log(' ************Leaving from lobby Reject********** ' + msg.data);

		lobby = {};
		lobby = lobbyAll[msg.data.lobby];

		console.log('***************lobby details++++++++++');
		console.log(lobby);
		lobby.players.map(function (row, i){
			if(row.name == msg.data.player)
			{
				row.status = 'Rejected';
				return;
			}			
		});

		sendPlayers(msg.data.lobby, lobby.players);

		lobbyAll[msg.data.lobby] = lobby;

		return respond(null, {response: 'going to microservice reject'});
	});

   	this.add('role:lobby,action:validateLobby', function(msg, respond) {
		console.log('-----------Inside Lobby MicroService---------');
		console.log('Validating Lobby ' + msg.data);

		lobby = {};
		lobby = lobbyAll[msg.data];
		
		// Logic
		if(lobby.topic == '')
		{
			return respond(null, {response: 'fail', message: 'Please select a topic'});	
		}
		else if(lobby.players.length < 3)
		{
			return respond(null, {response: 'fail', message: 'A minimum of 3 players required'});	
		}

		var playerStatusOk = true;
		lobby.players.map(function(row, i) {
			if(row.status != 'active')
			{
				playerStatusOk = false;
				return;
			}
		});

		if(playerStatusOk == false)
		{
			return respond(null, {response: 'fail', message: "All players should be 'active'"});	
		}

		sendGameStart(msg.data);

		lobby.players = [];
		lobby.lobbyStatus = 'close';

		lobbyAll[msg.data] = lobby;

		return respond(null, {response: 'success'});
		console.log('---------------------------------------------');
	});


	// Functions to Redis Middleware ..............................

	function sendPlayers(lobbyId, playerDetails) {
		console.log(' To Middleware : ' + lobbyId + ' and ');
		console.log(playerDetails);
		
		lobbyClient.act('role:lobbySub,lobbyId:'+lobbyId+',cmd:updatePlayerDetails', {data: playerDetails}, function(err, response) {
          console.log('Response from Middleware : ');
          console.log(response);
        });
	}

	function sendTopic(lobbyId, topic) {
		console.log(' To Middleware : ' + lobbyId + ' and ');
		console.log(topic);
		
		lobbyClient.act('role:lobbySub,lobbyId:'+lobbyId+',cmd:updateTopicDetails', {data: topic}, function(err, response) {
          console.log('Response from Middleware : ');
          console.log(response);
        });
	}

	function sendChat(lobbyId, chat) {
		console.log(' To Middleware : ' + lobbyId + ' and ');
		console.log(chat);
		
		lobbyClient.act('role:lobbySub,lobbyId:'+lobbyId+',cmd:updateChatDetails', {data: chat}, function(err, response) {
          console.log('Response from Middleware : ');
          console.log(response);
        });
	}

	function sendGameStart(lobbyId) {
		console.log('To Middleware to start game');
		
		lobbyClient.act('role:lobbySub,lobbyId:'+lobbyId+',cmd:lobbyGameStart', function(err, response) {
          console.log('Response from Middleware for Starting Game : ');
          console.log(response);
        });
	}
}