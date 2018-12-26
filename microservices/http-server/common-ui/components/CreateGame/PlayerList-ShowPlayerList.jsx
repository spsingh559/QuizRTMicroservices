// Component to display all added players
// Height Difference is set to maintain window height

import React from 'react';
var ReactDom = require('react-dom');

// Material component
import List from 'material-ui/List/List';

// Custom component
import ShowPlayer from './PlayerList-ShowPlayer.jsx';

var ShowPlayerList = React.createClass({
    delPlayer: function(index) {
        this.props.delete(index);
    },
    gotoLast: function() 
    {
        var node = ReactDom.findDOMNode(this);
        node.scrollTop = node.scrollHeight;
    },
    componentDidUpdate: function()
    {
        this.gotoLast();
    },

    render: function() {
        var rows = [];
        var pointThis = this;
        var heightOfComp;
        if(this.props.device == 'mobile')
        {
            if (this.props.user == 'admin')
            {
                heightOfComp = window.innerHeight - 288 + 'px';
            }
            else
            {
                heightOfComp = window.innerHeight - 243 + 'px';   
            }
        }
        else
        {
            heightOfComp = '300px';
        }
        
        this.props.players.map(function (row, i){
            rows.push(
                <ShowPlayer
                    delete={pointThis.delPlayer}
                    players={row}
                    playerIndex={i}
                    key={i}
                    device={pointThis.props.device}
                    user={pointThis.props.user}
            />);
        });
        
        if(this.props.device == 'mobile')
        {
            return (
                <div style={{height: heightOfComp, overflow: 'auto'}}>  
                    <List>
                        {rows}
                    </List>
                </div>
            );
        }
        else
        {
            return (
                <div style={{width: '90%', margin: 'auto'}}>
                    <List>
                        {rows}
                    </List>
                </div>
            );            
        }
    }
});

export default ShowPlayerList;