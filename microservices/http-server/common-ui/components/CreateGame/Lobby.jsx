// Main container which contain player details and Start/Exit buttons

import React from 'react';
import base64 from 'base-64';
import restUrl from '../../restUrl';

// Custom Components
import PlayerList from './PlayerList.jsx';
// var username = 'abc@xyz.in';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

var me;

var players = [];

var Lobby = React.createClass({
	getInitialState: function() {
		var username = (JSON.parse(base64.decode(localStorage.token.split('.')[1])).sub);
		me = this;
		return ({
            playr: [{'name': username, 'status': 'active', user: 'admin'}],
            open: false
        });
	},
	componentWillMount: function()
	{
		var me = this;
		var username = (JSON.parse(base64.decode(localStorage.token.split('.')[1])).sub);

		var url = window.location.href;
		var startPos = url.lastIndexOf('/lobby/') + 7;
		var lobbyId = url.substr(startPos, 13);

		this.context.socket.on('updatePlayer', function(data) {
			console.log('-------------- COMMAND TO UPDATE PLAYER RECEIVED --------------');
			console.log(data.data);

			var playerFound = false;
			data.data.map(function(playerData, i) {
				console.log(i+1 + '. ' + playerData.name);
				if(username == playerData.name)
				{
					playerFound = true;
					return;
				}
			});

			if(playerFound)
			{
				console.log('PLayer Found');
				me.setState({
					playr: data.data
				});
				players = data.data;
			}
			else
			{
				console.log('--------------Unsubscribe User---------------');
				me.context.socket.emit('unsubscribeLobby', {lobby: lobbyId});
				me.setState({open: true});
			}
	    });
	},
	handleClose: function()
	{
		this.context.router.push('/');
		this.setState({open: false});
	},
	addPlayerHandler: function(newname) {
		players.push({'name': newname, 'status': 'waiting for player','user': 'player'});

		var url = window.location.href;
		var startPos = url.lastIndexOf('/lobby/') + 7;
	    var lobbyId = url.substr(startPos, 13);

		var username = (JSON.parse(base64.decode(localStorage.token.split('.')[1])).sub);

		var addPlayerDetails = {
			player: newname,
			lobby: lobbyId,
			sender: username
		};

		// Notify Middleware to update in Microservice
		this.context.socket.emit('lobbyPlayerAdd', {data: addPlayerDetails});
		
		// Set State
		this.setState({
            playr: players
        });
	},
	delPlayerHandler: function(index) {
		var delName = players[index].name;

		var url = window.location.href;
		var startPos = url.lastIndexOf('/lobby/') + 7;
	    var lobbyId = url.substr(startPos, 13);

		var removePlayerDetails = {
			player: delName,
			lobby: lobbyId
		};

		this.context.socket.emit('lobbyPlayerDelete', {data: removePlayerDetails});

		players.splice(index, 1);
		this.setState({
            playr: players
        });
	},
	render: function() {
		const actions = [
	      <FlatButton
	        label="Ok"
	        primary={true}
	        onTouchTap={this.handleClose}
	      />
	    ];
		console.log('Rerender for Lobby : ');
		console.log(this.state.playr);
		console.log('User Type = ' + this.props.user);
	    return (
        	<div style={{width: '100%',display: 'block'}}>
        		<div style={{overflow: 'hidden'}}>
		            <PlayerList
		            	players={this.state.playr}
		            	addPlayerHandle={this.addPlayerHandler}
		            	delPlayerHandle={this.delPlayerHandler}
		            	// addRemovePlayerSocket={addRemovePlayerSocket}
		            	device={this.props.device}
		            	user={this.props.user}
		            />
		        </div>
		        <Dialog
		          title="Invalid Lobby"
		          actions={actions}
		          modal={false}
		          open={this.state.open}
		          onRequestClose={this.handleClose}
		        >
		          You are not a member in this Lobby!
		        </Dialog>
	        </div>
		);
    }
});

// addRemovePlayerSocket.on('add new player', function (data) {
// 	me.addPlayerHandler(data);
// });

// addRemovePlayerSocket.on('delete player', function (data) {
// 	me.delPlayerHandler(data);
// });

Lobby.contextTypes = {
	router: React.PropTypes.object.isRequired,
    socket: React.PropTypes.object.isRequired
};

export default Lobby;