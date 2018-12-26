import React from 'react';
import ReactDOM from 'react-dom';

// import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Snackbar from 'material-ui/Snackbar';
import NotificationComponent from './NotificationComponent.jsx';
// var socket = io();
// injectTapEventPlugin();

import restUrl from '../../restUrl';

import base64 from 'base-64';


export default class MainComponent extends React.Component{

  state = {
    data: [],
    dataNotFound:{},
    count:0,
    openDialogue:false, 
    dialogueMessage:''
  };


static get contextTypes() {
    return {
      router: React.PropTypes.object.isRequired,
      socket:React.PropTypes.object.isRequired
    }
  };
  
  handleAccept=(obj,id,typeID)=>{
    console.log('id is '+ id);
    console.log("*************"+obj);
    var currentData=this.state.data;
    console.log("Request object is");
    console.log(obj);
    console.log('currentData object is');
    console.log(currentData);
    var indexNumber;
    currentData.forEach(function(data,index){
      if(data._id==id){
          indexNumber=index;
      }
    });
console.log('index is '+ indexNumber);
    currentData[indexNumber].NotificationStatus=obj.NotificationStatus;
    currentData[indexNumber].notificationStatustext=obj.notificationStatustext;
    currentData[indexNumber].notificationResultStatus=obj.notificationResultStatus;
    this.setState({
      data:currentData 
    });
      var sendData={updateOBj:obj,id:id};
      console.log(sendData.updateOBj);
    $.ajax({
     url:restUrl+'/api/v1/notifications/',
     type:"PATCH",
     data:JSON.stringify(sendData),
     contentType: 'application/json',
     success:function (data) {
      // console.log('------------------You have accepted!')
      // console.log(data);
     }.bind(this),
     error:function(){
       console.log("error in submitting status");
     }.bind(this)
    });
    if(typeID!==undefined){
    this.context.router.push('/lobby/'+typeID);
  }

    
  };

  getNotification=()=>{
    // var targetId=2000; 
    var username = (JSON.parse(base64.decode(localStorage.token.split('.')[1])).sub);
    console.log("executed");
    $.ajax({
      url:restUrl+'/api/v1/notifications/'+username,
      type:'GET',
      success: function(data){
        if(data.msg==null){
         // alert('no notifications found');
         console.log('no data from DB---------------------');
        }else{
        console.log(data.msg);
        console.log(' data from DB---------------------');
       this.setState({
     data:data.msg
   });
     }
      }.bind(this),
      error:function(err){
        console.log('notifications error');
      }.bind(this)
    });
    
  };

  componentWillMount=()=>{
    this.getNotification();
    var username = (JSON.parse(base64.decode(localStorage.token.split('.')[1])).sub);
    this.context.socket.emit('notificationSubscriberName',{data: username});

  };

  handleUnreadNotification=(url)=>{
    var username = (JSON.parse(base64.decode(localStorage.token.split('.')[1])).sub);
   console.log(url+'/'+username);
    $.ajax({
     url:url+'/'+username,
     type:"GET",
     success:function (data) {
      console.log("*********"+data);
       if(data.response=="no data found"){
         alert('NO data For this Notification');
       }else{
         this.setState({
           data: data.msg
         });
         // console.log('**********************************');
       }
     }.bind(this),
     error:function(){
       console.log("error");
     }.bind(this)
    });
  };

  
  handleSearchText=(text)=>{
    alert(text);
  };

componentDidMount =()=> {

    var me = this;

    this.context.socket.on('connection', (msg) => {
      // console.log('Queued');
      this.setState({openDialogue: msg.status,dialogueMessage:msg.message});
    });

    this.context.socket.on('notificationMsg', (msg) => {
      console.log('============ Inside Notification to update list');
      console.log(msg.message);
      var currentData=me.state.data;
      var newData=[msg.message].concat(currentData);
      me.setState({data:newData});
    });
  }

  render(){
    return(
      <div>
      <NotificationComponent notificationData={this.state.data}
      handleAcceptStatus={this.handleAccept} 
      fetchSelectedNotification={this.handleUnreadNotification}
      RecentNotification={this.getNotification}
      searchText={this.handleSearchText}
        
         />
         <Snackbar
                  open={this.state.openDialogue}
                  message={this.state.dialogueMessage}
                  autoHideDuration={10000}
                  // onRequestClose={this.handleRequestClose}
                />
       </div>
       
       );
    }
  }


// var a =ReactDOM.render(<MainComponent />,document.getElementById('app'));