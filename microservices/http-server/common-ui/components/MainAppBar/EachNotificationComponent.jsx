import React from 'react';
import ReactDOM from 'react-dom';
import Avatar from 'material-ui/Avatar';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import Chip from 'material-ui/Chip';
// <i class="material-icons">panorama_fish_eye</i>
import PanormaFish from 'material-ui/svg-icons/image/panorama-fish-eye';
import Delete from 'material-ui/svg-icons/action/delete';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {blue500, yellow600,green500,orange500,brown500,greenA200} from 'material-ui/styles/colors';
// For username
import base64 from 'base-64';

const styles = {
  chip: {
    margin: 4,
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};
var mySocket;
export default class EachNotificationComponent extends React.Component{
    // state={
    //   color:'orange';
    // }
   static get contextTypes() {
    console.log('')
    return {
     router: React.PropTypes.object.isRequired,
     socket:React.PropTypes.object.isRequired
    }
  };

    handleAccept=()=>{
      // alert('click');
      console.log(this.props.id);
//       socket.on('addLobbyIdtoNotification',function(data){
// this.context.router.push('/lobby/'+data);
//       });
        
      var obj={
       notificationStatustext:"You have Accepted",
       NotificationStatus:false,
       notificationResultStatus:true
     };
     var routeTOLobby=this.props.NotificationTypeId;
     // this.props.AcceptStatus(obj,this.props.id);
    this.props.AcceptStatus(obj,this.props.id,routeTOLobby);
     // this.props.CountReduce();
   };

    handleReject=()=>{
      var obj={
        notificationStatustext:"You have Rejected",
        NotificationStatus:false,
        notificationResultStatus:false
      };
      this.props.AcceptStatus(obj,this.props.id);

      var username = (JSON.parse(base64.decode(localStorage.token.split('.')[1])).sub);
      var dataToPass = {
        lobby: this.props.NotificationTypeId,
        player: username
      };

      this.context.socket.emit('RejectHandle',{data:dataToPass});
      // this.props.CountReduce();
   };


    titleClick=()=>{
      // alert('title Click');
   };
    
    render()  {   

      var style,textColor;
             if(this.props.notificationResultStatus==true){
            style='#f5f5f0';
            textColor='green';
          }else if(this.props.notificationResultStatus==false){
            style='white';
            textColor='orange';
          }

      var AcceptRejectBtn=this.props.NotificationStatus?
        [
        <FlatButton
          label="Accept"
          primary={true}
          // labelStyle={{color:'black'}}
          style={{marginRight:'70px'}}
          onTouchTap={this.handleAccept}
         />,
        <FlatButton
          label="Reject"
          secondary={true}
          // labelStyle={{color:'orange'}}
          onTouchTap={this.handleReject}
        />
        ]  
    :
    <Chip  labelStyle={{color:textColor}} backgroundColor='white'>
    {this.props.notificationStatustext}</Chip>;
    
var displayName;
var endPos = this.props.NotificationOwnerId.indexOf('@'); 
displayName = this.props.NotificationOwnerId.substr(0, endPos);
displayName = displayName.substr(0,1).toUpperCase() + displayName.substr(1).toLowerCase();
   console.log('ciurrent status of data in each Noti'+this.props.Currentdata);
      // if(this.state.isNotificationBtnActive==false){
      //  AcceptRejectBtn=<Chip>{this.state.notificationStatustext}</Chip>
      // }
      // var ownerName=this.props.NotificationOwnerId==1001?'Ravi':
      //     this.props.NotificationOwnerId==1002?'Jeevan':null;
      if(this.props.Currentdata!=undefined)
      {
      return(
        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
        <Card style={{marginTop:'10px',backgroundColor:style}}
        key={this.props.id}>
          <CardHeader
            title={displayName +" "+ this.props.NotificationSubTitle}
            titleStyle={{fontSize:'18px',color:'black'}}
            subtitle= {this.props.DateAndTime}
            subtitleStyle={{color:'black'}}
            href="#"
            avatar={<Avatar src='./../img/Lobby/user.png' />}
            onTouchTap={this.titleClick}
          />
          <CardActions>
              <div style={{marginLeft:'60px',marginTop:'-10px',
                          fontFamily:'italic'}}>
                {AcceptRejectBtn}
             </div>
             
          </CardActions>        
        </Card>  
        </div>          
      );
    } else {
      return (
      <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
        <Card style={{marginTop:'10px',backgroundColor:style}}
       >
          <CardHeader
            title="No Data Found"
            titleStyle={{fontSize:'18px',color:'black'}}
            subtitle= "You don't have any Notification"
            subtitleStyle={{color:'black'}}
            href="#"
          />        
        </Card>  
        </div>    
        );  
    }
    
    }
 }