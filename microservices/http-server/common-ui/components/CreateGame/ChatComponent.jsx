// Chat Main Component
// Messages are fetched from this component
// Set-Interval from checking backend
// Passing Height Difference to set window height

// Material Components
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import React from 'react';

// Custom Components
import DisplayMessageComponent from './DisplayMessageComponent.jsx';
import ChatFooterComponent from './ChatFooterComponent.jsx';

 var  chat;
// Message Array - Need to fetch from Backend
var message=[];

// Chat Component
var ChatComponent = React.createClass({
	getInitialState:function()
	{
		chat = this;
	    return ({
	    	data: [],
	    });
	},
	getMessages: function ()
	{	
		this.setState({
			data: message
		});
	},
	handleSend:function(name, msg)
	{
		var url = window.location.href;
		var startPos = url.lastIndexOf('/lobby/') + 7;
		var lobbyId = url.substr(startPos, 13);

		var newMsg={
			name:name,
			msg:msg,
			lobby: lobbyId
		}

		this.context.socket.emit('chatNewMessage', {msgData: newMsg});
		// AJAX Post operation Here
		
		message.push(newMsg);
		this.setState({
			data:message
		});		
	},
	componentWillMount: function()
	{
		this.getMessages();
		var me = this;
		this.context.socket.on('updateChat', function(chatData) {
			console.log('-------------- COMMAND TO UPDATE CHAT RECEIVED --------------');

			message = chatData.data;

			me.setState({
				data:message
			});
		});
	},
	render:function()
	{
		return(
			<div style={{width:"100%", marginTop: '10px'}}>				
				<Paper style={{padding:"5px 0px", paddingTop: '0px'}}>
					<DisplayMessageComponent
						data={this.state.data}
						device={this.props.device}
					/>
					<Divider /><br />
					<ChatFooterComponent handleSend={this.handleSend} />
				</Paper>
			</div>
		);
	}
});

ChatComponent.contextTypes = {
    socket: React.PropTypes.object.isRequired
};

//chatSocket={chatSocket}

// chatSocket.on('update message', function(data) {
// 	console.log("Sending Message");
// 	chat.handleSend(data.name, data.message);



// });

export default ChatComponent;