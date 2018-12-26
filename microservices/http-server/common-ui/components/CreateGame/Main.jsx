// Entry Component - contains entire containers

import React from 'react';
import ReactDOM from 'react-dom';

import base64 from 'base-64';

// Plugin for Touch tap
// import injectTapEventPlugin from 'react-tap-event-plugin';
// injectTapEventPlugin();

// Theme
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

// Material Component
import AppBar from 'material-ui/AppBar';

// Custom Components
import BodyContent from './BodyContent.jsx';
import DesktopBodyContent from './Desktop/DesktopBodyContent.jsx';

var screenWidthLimiter = 768;
// Main Component
var CreateGame = React.createClass({
	getInitialState() {
		return {
	        windowWidth: window.innerWidth
	    };
	},
	// alterPageHeight() {
	// 	var node = ReactDOM.findDOMNode(this);
	// 	if (hf != 0)
	// 	{
	// 		this.setState({
	// 			heightDiff: hf
	// 		});
	// 	}
	// },
	handleResize: function(e) {
		this.setState({windowWidth: window.innerWidth});

		var username = (JSON.parse(base64.decode(localStorage.token.split('.')[1])).sub);
    
	    var url = window.location.href;
	    var startPos = url.lastIndexOf('/lobby/') + 7;
	    var lobbyId = url.substr(startPos, 13);
	    
	    var dataTopass={
	      username:username,
	      lobbyId:lobbyId
	    };

		this.context.socket.emit('getLobbyDetails', {data: dataTopass});
	},

	componentDidMount: function() {
		window.addEventListener('resize', this.handleResize);
		// if (window.innerWidth <= screenWidthLimiter)
		// {
		// 	this.alterPageHeight();
		// }
	},

	componentWillUnmount: function() {
		window.removeEventListener('resize', this.handleResize);
	},

  	render() {
  		console.log(window.innerWidth);
  		if (window.innerWidth > screenWidthLimiter)
  		{
  			return (
			    <div style={{paddingTop: '64px', backgroundColor: 'white'}}>
			    	<DesktopBodyContent user={this.props.user}/>	
				</div>
		    );
  		}
  		else
  		{
		    return (
			    <div style={{paddingTop: '64px', backgroundColor: 'white'}}>
			    	<BodyContent user={this.props.user}/>	
				</div>
		    );
		}
  	}
});

export default CreateGame;

CreateGame.contextTypes = {
    socket: React.PropTypes.object.isRequired
};

// ReactDOM.render(
// 	<MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
// 		<CreateGame />
// 	</MuiThemeProvider>,
// 	document.getElementById('content')
// );