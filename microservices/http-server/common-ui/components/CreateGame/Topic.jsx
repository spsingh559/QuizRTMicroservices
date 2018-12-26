// Component to handle viewing and adding Topic for Quiz
// Once topic is added, it should update the backend

import React from 'react';

// Custom Components
import AddTopic from './Topic-AddTopic.jsx';
import ShowTopic from './Topic-ShowTopic.jsx';
import restUrl from '../../restUrl';

var  topic, me;

var Topic = React.createClass({
	getInitialState: function()
    {
        me = this;
        console.log("Initializing Topic");
        this.butLab = ' ';
        topic = this;
        
        return {
            topic: true,
            topicName: 'initial',
            color: 'lightgrey'
        };
    },

    componentWillMount:function()
    {
        this.context.socket.on('updateTopic', function(data) {
            console.log('-------------- COMMAND TO UPDATE TOPIC RECEIVED --------------');
            console.log(data.data);
            
            if(data.data != '')
            {
                me.setState({
                    topic: true,
                    topicName: data.data,
                    color: 'black'
                });
            }
        });
    },
    handleChange: function(operation, val) {
    	if(operation == 'change')
    	{
            if(val == 'initial')
            {
                val = '';
            }
	    	this.setState({
	    		topic: false,
	    		topicName: val
	    	});
	    }
	    else if(operation == 'add')
	    {
            this.butLab = 'change';

            var url = window.location.href;
            var startPos = url.lastIndexOf('/lobby/') + 7;
            var lobbyId = url.substr(startPos, 13);

            var addTopicDetails = {
                topic: val,
                lobby: lobbyId
            };

            console.log('Topic Changed');

            this.context.socket.emit('topicChange',{data:addTopicDetails});

            // AJAX POST Operation here
	    	
            this.setState({
	    		topic: true,
	    		topicName: val,
                color: 'black'
	    	});
	    }
    },
    render: function() {
        var backColor;
        if(this.props.device === 'mobile')
        {
            backColor = '#e6fcff';
        }
        else
        {
            backColor = 'white';
        } 
    	if(this.state.topic)
    	{
        	return (
	        	<div style={{padding: '0px',width: '100%'}}>
	            	<ShowTopic
                        change={this.handleChange}
                        topic={this.state.topicName}
                        color={this.state.color}
                        buttonLabel={this.butLab}
                        background={backColor}
                        user={this.props.user}
                    />
	            </div>
        	);
        }
        else
        {
        	return (
	        	<div style={{padding: '0px',width: '100%'}}>
	            	<AddTopic
                        change={this.handleChange}
                        defaultVal={this.state.topicName}
                        background={backColor}
                    />
	            </div>
        	);
        }
    }
});

Topic.contextTypes = {
    socket: React.PropTypes.object.isRequired
};

// topicSocket.on('update topic', function(val) {
//     topic.handleChange('add', val);
// });

export default Topic;