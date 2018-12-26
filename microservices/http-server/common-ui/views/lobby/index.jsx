import CreateLobby from '../../components/CreateGame/Main.jsx';
import MainAppBar from '../../components/MainAppBar';
import React from 'react';
import restUrl from '../../restUrl';
import base64 from 'base-64';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

var me;

export default class CreateGameApp extends React.Component {
  constructor() {
    super();
    this.state={
      user: 'player',
      open: false
    }
  };

  static get contextTypes() {
    console.log('')
    return {
     router: React.PropTypes.object.isRequired,
     socket:React.PropTypes.object.isRequired
    }
  };

 componentWillMount() {
    var username = (JSON.parse(base64.decode(localStorage.token.split('.')[1])).sub);
    
    var url = window.location.href;
    var startPos = url.lastIndexOf('/lobby/') + 7;
    var lobbyId = url.substr(startPos, 13);

    console.log("current user name0 = "+username);
    console.log('current url='+window.location.href + ' ' + lobbyId);   
    var dataTopass={
      username:username,
      lobbyId:lobbyId
    };

    console.log('Going to Subscribe');
    this.context.socket.emit('subscribeLobby', {data: dataTopass});
    this.context.socket.emit('setUserActive', {data: dataTopass});
  };
  componentDidMount() {
    me = this;
    var username = (JSON.parse(base64.decode(localStorage.token.split('.')[1])).sub);
    
    var url = window.location.href;
    var startPos = url.lastIndexOf('/lobby/') + 7;
    var lobbyId = url.substr(startPos, 13);
    
    var dataTopass={
      username:username,
      lobbyId:lobbyId
    };
    this.context.socket.emit('getLobbyDetails', {data: dataTopass});
    
    this.context.socket.on('adminUser', function(data) {
      console.log(' Admin is ' + data.data);
      if(username == data.data)
      {
        me.setState({
          user: 'admin'
        });
      }
    });

    this.context.socket.on('invalidLobby', function(data) {
      console.log('INVALID LOBBY');
      me.context.socket.on('unsubscribeLobby', {lobby: lobbyId});
      me.setState({open: true});
    });
  };

  handleClose() {
    me.setState({open: false});
    me.context.router.push('/');
  };

  render() {
    const actions = [
      <FlatButton
        label="Ok"
        primary={true}
        onTouchTap={this.handleClose}
      />
    ];
    return (
      <div>
        <MainAppBar />
        <CreateLobby user={this.state.user}/>
        <Dialog
          title="Invalid Lobby"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          You don't belong here!!
        </Dialog>
      </div>
    );
  }
}

