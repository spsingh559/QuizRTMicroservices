// Each chat component - smallest container in chat lifeline

// Material Components
import React from 'react';
import Chip from 'material-ui/Chip';
import Paper from 'material-ui/Paper';
import {green100, blue100, indigo900} from 'material-ui/styles/colors';

import base64 from 'base-64';
// Setting the current user name - later should fetch from Session

var MessageComponent=React.createClass({

	render:function()
	{
		const user = (JSON.parse(base64.decode(localStorage.token.split('.')[1])).sub);

		var data=this.props.data, myColor;

		if(data.name == user)
		{
			return(
				<div style={{padding:"5px", width: '100%', float: 'right'}}>
					<Chip backgroundColor={green100}
						style={{ margin: "0px",maxWidth:"90%", overflow: 'auto', minWidth: '80px', float: 'right'}}>
						<p style={{margin:"0px"}}>
							<span style={{color:"#00008B"}}>Me</span>&nbsp;&nbsp;&nbsp;{data.msg}
						</p>
					</Chip>
				</div>
			);
		}
		else
		{
			var displayName;
			var endPos = data.name.indexOf('@'); 
			displayName = data.name.substr(0, endPos);
			displayName = displayName.substr(0,1).toUpperCase() + displayName.substr(1).toLowerCase();

			return(
				<div style={{padding:"5px", width: '100%'}}>
					<Chip backgroundColor={blue100}
						style={{ margin: "0px",maxWidth:"90%",  overflow: 'auto',minWidth: '80px', minWidth: '50px'}}>
						<p style={{margin:"0px"}}>
							<span style={{color:"#00008B"}}>{displayName}</span>&nbsp;&nbsp;&nbsp;{data.msg}
						</p>
					</Chip>
				</div>
			);
		}
	}
});

export default MessageComponent;