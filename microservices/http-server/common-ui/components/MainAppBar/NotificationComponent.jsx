import React from 'react';
import ReactDOM from 'react-dom';
import Badge from 'material-ui/Badge';
import IconButton from 'material-ui/IconButton';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import Avatar from 'material-ui/Avatar';
import AppBar from 'material-ui/AppBar';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MediaQuery from 'react-responsive';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import PersonAdd from 'material-ui/svg-icons/social/person-add';
import InsertInvitation from 'material-ui/svg-icons/editor/insert-invitation';
import Content from 'material-ui/svg-icons/content/markunread';
import Today from 'material-ui/svg-icons/action/today';
import Notification from 'material-ui/svg-icons/notification/event-note';
import Search from 'material-ui/svg-icons/action/search';
import Chat from 'material-ui/svg-icons/communication/chat';
import Hardware from 'material-ui/svg-icons/hardware/keyboard-backspace';
import restUrl from '../../restUrl';
import RaisedButton from 'material-ui/RaisedButton';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import {
blue500,
indigo900,
orange500,
deepOrange300,
pink400,
purple500,
green500,
brown500
} from 'material-ui/styles/colors';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import TextField from 'material-ui/TextField';
import EachNotificationComponent from './EachNotificationComponent.jsx';

export default class NotificationComponent extends React.Component {
  state={
    openDialoge:false,
    count:0,
    step:1,
    searchText:'',
    dialogTitle:'Recent Notification',
    searchResultText:'',
    searchStyle:'none'
  };

  handleBadge=()=>{


    this.setState({
      openDialoge:true 
    });
  };

  handleClose=()=>{

    this.setState({
      openDialoge:false
    });

  };

  // handleAcceptRequest=(obj,id)=>{
  //   console.log(obj)

  //   this.props.handleAcceptStatus(obj,id);
  // };

  handleAcceptRequest=(obj,id,typeID)=>{
    console.log(obj)

    this.props.handleAcceptStatus(obj,id,typeID);
  };




 UnreadNoti=()=>{
  var NotificationId=6;
  var url= restUrl+'/api/v1/notifications/'+NotificationId;
   
    this.props.fetchSelectedNotification(url);
    this.setState({
      dialogTitle:'All Unread Notification',
      searchStyle:'none' 
    });
  };

  FriendNoti=()=>{
    var NotificationId=5;
    var url= restUrl+'/api/v1/notifications/'+NotificationId;
    console.log(url);

    // var url="http://localhost:8070/notification?NotificationId=1&NotificationTargetId=";
    this.props.fetchSelectedNotification(url);
    this.setState({
      dialogTitle:'All Friend Request',
      searchStyle:'none' 
    });
  };

  tournamentNotification=()=>{
    var NotificationId=2;
     var url= restUrl+'/api/v1/notifications/'+NotificationId;
     console.log(url);
    
    this.props.fetchSelectedNotification(url);
    this.setState({
      dialogTitle:'All Tournament Notifications',
      searchStyle:'none' 
    });
  };

  GameInvitation=()=>{
    var NotificationId=3;
     var url= restUrl+'/api/v1/notifications/'+NotificationId;
    
    this.props.fetchSelectedNotification(url);
    this.setState({
      dialogTitle:'All Game Invitations',
      searchStyle:'none' 
    });
  };

  ChatInvitation=()=>{
    var NotificationId=4;
     var url= restUrl+'/api/v1/notifications/'+NotificationId;
    
    this.props.fetchSelectedNotification(url);
    this.setState({
      dialogTitle:'All Chat Invitation',
      searchStyle:'none'
    });
  };

  RecentInvitation=()=>{
    this.props.RecentNotification();
    this.setState({
      dialogTitle:'Recent Notification',
      searchStyle:'none' 
    });
  };

  searchNotification=()=>{
    
    this.searchStyle='initial';
    this.setState({
      dialogTitle:'Search Notification',
      searchStyle:'initial',
      searchText:''
    });

    var NotificationId=this.state.searchText;
     var url= restUrl+'/api/v1/notifications/'+NotificationId;
   // var ownerId=this.state.searchText=='Shyam'?'Shyam@gmail.com':
   // this.state.searchText=='Sukirthana'?'Sukirthana@gmail.com':null;
    // var url="http://localhost:8070/notification?NotificationOwnerId="+ownerId+'&NotificationTargetId=';
    this.props.fetchSelectedNotification(url);  
    
  };
  
backNotification=()=>{
    this.props.RecentNotification();
    this.setState({
      dialogTitle:'Recent Notification',
      searchText:'',
      searchStyle:'none'
    }); 
}

  searchTextChange=(e)=>{
    this.setState({
      searchText:e.target.value
    });
  };

  render() {
   var friendsCounts=0;
  var tournamentCount=0;
  var privateGameCount=0;
  var chatCount=0;
  var counts=0;
  this.props.notificationData.forEach(function(data){
    if(data.NotificationStatus==true)
    {   counts++; 
      switch(data.NotificationId){
        case 5:return(friendsCounts++);
                break;
        case 2:return(tournamentCount++);
              break;
        case 3:return(privateGameCount++);
                break;
        case 4:return(chatCount++);
                break;
        // default:alert('no result found');
        //         break;
      }
    }
  });

var hardwareIcon;

  if(this.state.dialogTitle!='Recent Notification'){
    hardwareIcon=[<Hardware color='white' style={{top:'10px'}}
    onTouchTap={this.backNotification}
    />];
  }else{
    hardwareIcon=null;
  };
  //  for(var i=0;i<this.props.notificationData.length;i++){
  //   var a=this.props.notificationData[i];
  //   if(a.NotificationStatus==true){
  //     if(a.NotificationTitle=='Friend Request'){
  //     friendsCounts++;
  //   }else if(a.NotificationTitle=='Tournament Participation'){
  //     tournamentCount++;
  //   }
  // }

  // var countNumber=counts-this.state.count;
  // var Badge=counts==0?
  //         <IconButton tooltip="Notifications" onTouchTap={this.handleBadge}>
  //         <NotificationsIcon color="white"/>
  //         </IconButton>
  //         :
  //         <Badge
  //         badgeContent={countNumber}
  //         primary={true} 
  //         badgeStyle={{top: 15, right: 20}} 
  //         >
  //         <IconButton tooltip="Notifications" onTouchTap={this.handleBadge}>
  //         <NotificationsIcon color="white"/>
  //         </IconButton>
  //         </Badge>

  var resultLength='* '+this.props.notificationData.length+'  Result found for Search';
  console.log(resultLength);
  console.log(this.props.notificationData);
           
  var rows=[];

     console.log(this.props.notificationData);
  var data=this.props.notificationData.map(function(data){
        
    return(
      <div key={data._id}>
      <EachNotificationComponent 
      Currentdata={this.props.notificationData}
      socket={this.props.socket}
      AcceptStatus={this.handleAcceptRequest}
      CountReduce={this.handleCount}
      id={data._id}
      NotificationId={data.NotificationId}
      NotificationTypeId={data.NotificationTypeId}
      notificationResultStatus={data.notificationResultStatus}
      NotificationOwnerId={data.NotificationOwnerId}
      NotificationOwnerPic={data.NotificationOwnerPic}
      NotificationTitle={data.NotificationTitle}
      NotificationSubTitle={data.NotificationSubTitle}
      DateAndTime={data.DateAndTime}
      isNotificationActive={data.isNotificationActive}
      NotificationStatus={data.NotificationStatus}
      notificationStatustext={data.notificationStatustext}
      />
      </div>
      );

  }.bind(this));

  var SeeAllNotificationBtn=[
  <FlatButton
    label="Close"
    onTouchTap={this.handleClose}
    primary={true}
    />
  ];
console.log(this.searchStyle);
  // var a=[<Hardware color='white'/>,this.state.dialogTitle];

  var titles=[
   <Toolbar style={{backgroundColor:'#00AFF0 ',overflow:'hidden'}}>
   <ToolbarGroup>
     <ToolbarTitle text={hardwareIcon}
     style={{marginTop:'15px'}}
     />
     </ToolbarGroup>
 <ToolbarGroup>
     <div style={{ color:'white',overflow:'hidden'}}>  

<MediaQuery query='(max-device-width: 800px)'>
                 <MediaQuery query='(max-width: 800px)'>
  <ToolbarTitle text={this.state.dialogTitle}
     style={{color:'white',overflow:'hidden',float:'left',fontSize:'15px'}}
     />
      </MediaQuery>
               </MediaQuery>
               <MediaQuery query='(min-device-width: 800px)'>
                 <MediaQuery query='(min-width: 800px)'>
                  <ToolbarTitle text={this.state.dialogTitle}
     style={{color:'white',overflow:'hidden',float:'left',fontSize:'20px'}}
     />
      </MediaQuery>
               </MediaQuery>
               </div>
      </ToolbarGroup>
     

   

     <ToolbarGroup  style={{color:'white',overflow:'hidden'}}>
     <ToolbarSeparator />
     <IconMenu 
     iconButtonElement={
       <IconButton><MoreVertIcon color='white'/></IconButton>
     }
     targetOrigin={{horizontal: 'right', vertical: 'top'}}
     anchorOrigin={{horizontal: 'right', vertical: 'top'}}
     >
     <MenuItem primaryText="Unread Notifications" 
     onTouchTap={this.UnreadNoti} 
     rightIcon={<Badge
         badgeContent={counts}
          secondary={true} 
         />}
     leftIcon={<Content color={orange500} />} 
     />
     <MenuItem primaryText="Friend Notifications" 
     onTouchTap={this.FriendNoti} 
     rightIcon={<Badge
         badgeContent={friendsCounts}
          secondary={true} 
         />}
     leftIcon={<PersonAdd color={blue500}/>} 
     />
     <MenuItem primaryText="Tournament Notifications" 
     onTouchTap={this.tournamentNotification}
     rightIcon={<Badge
         badgeContent={tournamentCount}
          secondary={true} 
         />}
     leftIcon={<InsertInvitation color={green500} />} 
     />
     <MenuItem primaryText="Game Notifications" 
     onTouchTap={this.GameInvitation}
     rightIcon={<Badge
         badgeContent={privateGameCount}
          secondary={true} 
         />}
     leftIcon={<Today color={brown500}/>} 
     />
     <MenuItem primaryText="Chat Notifications" 
     onTouchTap={this.ChatInvitation}
     rightIcon={<Badge
         badgeContent={chatCount}
          secondary={true} 
         />}
     leftIcon={<Chat color={green500}/>} 
     />
     <Divider />
     <MenuItem primaryText="Recent Notifications" 
     onTouchTap={this.RecentInvitation}
     rightIcon={<Badge
         badgeContent={counts}
          secondary={true} 
         />}
     leftIcon={<Notification color={purple500}/>} 
     />
     </IconMenu>
     </ToolbarGroup>
 </Toolbar>
 ];
  if(counts==0){
 return(
   <div >
 
         <IconButton onTouchTap={this.handleBadge} style={{padding:'24px 24px 12px 12px'}} >
         <NotificationsIcon color="white"
         />
         </IconButton>
      <Dialog
       modal={false}
       title={titles}
       actions={SeeAllNotificationBtn}
       open={this.state.openDialoge}
       onRequestClose={this.handleClose}
       autoScrollBodyContent={true}
       >
         <div>          <span style={{display:this.state.searchStyle,
           fontSize:'15px',
           color:'brown',overflow:'hidden'}}>
           {resultLength}
         </span>
            {data}
         </div>
     </Dialog>
     
   </div>
   )
}else {
 return (
   <div >
 
         <Badge
         badgeContent={counts}
         primary={true}
         style={{padding:'15px 16px 12px 12px !important',marginTop:'10px',marginRight:'20px'}}
         badgeStyle={{top: 0, right: -10, height:'25px'}}
         >
         <IconButton onTouchTap={this.handleBadge}>
         <NotificationsIcon color="white"
         />
         </IconButton>
         </Badge>
      <Dialog
       modal={false}
       title={titles}
       actions={SeeAllNotificationBtn}
       open={this.state.openDialoge}
       onRequestClose={this.handleClose}
       autoScrollBodyContent={true}
       >
         <div>          <span style={{display:this.state.searchStyle,
           fontSize:'15px',
           color:'brown',overflow:'hidden'}}>
           {resultLength}
         </span>
            {data}
         </div>
     </Dialog>
     
   </div>
  );
 }
  }
}