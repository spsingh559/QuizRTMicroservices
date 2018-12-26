var mongoose = require('mongoose');
const notifications=require('./notification.schema');
const friends = require('./onlineFriend.schema');
module.exports = function(options){
console.log(options.mongoUrl);
mongoose.connect(options.mongoUrl);
var db = mongoose.connection;
var seneca = require('seneca');
var notificationClient = seneca();
this.add('role:notification,cmd:getAllNotification', function(msg, respond) {
    console.log("======Notification Service============================");
    console.log(msg);
    var targetID=msg.username;

   return  notifications.find( {NotificationTargetId:targetID}).sort({DateAndTime: -1}).exec(function(err,data){
if(err) { return respond(err); }
      if(data.length === 0) 
      { return respond(null,{response:'no data found'});
  }
      else{
      return respond(null,{msg:data});
      console.log(msg.data);
      }
  });

    });

this.add('role:notification,cmd:getSelectedNotification', function(msg, respond) {
    console.log("======Notification Service Menu============================");
    console.log(msg.NotificationData.username);
     console.log(msg.NotificationData.Id);
    var username=msg.NotificationData.username;
    var id=msg.NotificationData.Id;
    console.log(id);
     // return respond(null,{msg:'data'});
     // db.notifications.find({$and:[{NotificationId:2},{NotificationTargetId:"spsingh559"}]}).pretty()
if(id==6){
    return  notifications.find( {$and:[{NotificationStatus:true},{NotificationTargetId:username}]}).exec(function(err,data){
if(err) { return
console.log("error in getAllNotifications");
 respond(err); }
      if(data.length === 0) 
      { return respond(null,{response:'no data found'});
  }
      else{
      return respond(null,{msg:data});
      console.log(msg.data); }
  });
  }
  else{
    return  notifications.find( {$and:[{NotificationId:id},{NotificationTargetId:username}]}).exec(function(err,data){
if(err) { return
console.log("error in getAllNotifications");
 respond(err); }
      if(data.length === 0) 
      { return respond(null,{response:'no data found'});
  }
      else{
      return respond(null,{msg:data});
      console.log(msg.data); }
  });
  }
  });

this.add('role:notification,cmd:update', function(msg, respond) {
    console.log("======Notification Service update============================"+msg);

    var objectid=msg.id;
    console.log("=========object id in update microservice is"+ objectid);
    console.log("=========NotificationStatus id in update microservice is"+ msg.updateOBj.NotificationStatus);
var NotificationStatus=msg.updateOBj.NotificationStatus;
var notificationStatustext=msg.updateOBj.notificationStatustext;
var notificationResultStatus=msg.updateOBj.notificationResultStatus;
   return notifications.findOneAndUpdate({_id:objectid},
                 {$set:{NotificationStatus:msg.updateOBj.NotificationStatus,
                         notificationStatustext:msg.updateOBj.notificationStatustext,
                         notificationResultStatus:msg.updateOBj.notificationResultStatus
                 }},function(err, data){
               if(err){return
console.log("error in getAllNotifications");
 respond(err); }else{
        console.log('-----------------------data updated-------------------');
        console.log(data);
         return respond(null,{msg:data});
      
    }
           });

    });


this.add('role:notification,cmd:newNotification', function(msg, respond) {
    console.log("======Notification Service Add Notification============================"+msg);
    // player: newname,
    //   lobby: lobbyId,
    //   sender: username

    console.log(msg.typeID);
var msg={
  NotificationTypeId:msg.typeID,
     NotificationId: msg.type,
     NotificationOwnerId: msg.senderID,
     NotificationTargetId: msg.targetID,
     NotificationOwnerPic: "./image/notificationOwnerPic.jpg",
     NotificationTitle: "",
     NotificationSubTitle: "",
     DateAndTime: new Date(),
     NotificationStatus: true,
     notificationStatustext: "No status",
     notificationResultStatus: false
   };
   switch(msg.NotificationId){
    case 2:
     msg.NotificationTitle="Tournament Participation";
     msg.NotificationSubTitle="has sent Invitation for playing Tournament";
    break;
    case 5:
     msg.NotificationTitle="Friend Request";
     msg.NotificationSubTitle="has sent Friend request";
    break;
    case 3:
     msg.NotificationTitle="Private Game Invitation";
     msg.NotificationSubTitle="has sent Game Invitation";
    break;
    case 4:
     msg.NotificationTitle="Chat Invitation";
     msg.NotificationSubTitle="hassent Chat Invitation ";
    break;
       
      }

    console.log(msg);
    return notifications.create(msg,function(err, data){
     if(err){
      console.log('error in finding');
    }else{
      console.log('success');
      console.log(msg);
      

      var playerId = data.NotificationTargetId;

      notificationClient.use('redis-transport');
       
      notificationClient.client({
        type: 'redis',
        pin: 'role:notification,playerId:'+playerId+',cmd:*',
        host: '172.23.238.251'
      });

      notificationClient.act('role:notification,playerId:'+playerId+',cmd:send',{msg: data}, function(err, response) {
        console.log(response);
        socket.emit('connection', {status:true,message:'Notification sent'});    
      }); 

      return respond(null,{msg:data});

    }
    });
  });
  

  this.add('role:notification,cmd:getAllOnlineUserStatus', function(msg, respond) {
    console.log("======Notification getAllOnlineUserStatus Service============================");
    // console.log(msg);
    // var username=msg.userName;

    return  friends.find().exec(function(err,data){
      console.log('******************8'+data.length);
      if(err) { return respond(err); }

      if(data.length == 0) 
        { 
          return respond(null,{response:'null'});
          console.log('*****************'+response);
    }
    else{

      console.log('data found');
      console.log(data);
      return respond(null,{msg:data});
      // console.log(msg.data);
    }
  });


  });


  this.add('role:notification,cmd:getSelectedUserStatus', function(msg, respond) {
    console.log("======Notification getUser Service============================");
    console.log(msg);
    var username=msg.userName;

    return  friends.find( {userName:username}).exec(function(err,data){
      console.log('******************8'+data.length);
      if(err) { return respond(err); }

      if(data.length == 0) 
        { 
          return respond(null,{response:'null'});
          console.log('*****************'+response);
    }
    else{

      console.log('data found');
      console.log(data);
      return respond(null,{msg:data});
      // console.log(msg.data);
    }
  });


  });
  // this.add('role:notification,cmd:insertUser',function(msg,respond){
  //    return friends.insert({userName:msg.username,onlineStatus:msg.status},function(err,data){
  //         if(err) { return respond(err); }
  //         else{
  //           return respond(null,{msg:data});
  //           console.log(msg.data);
  //         }
  //       });

  // });

  this.add('role:notification,cmd:updateOnlineStatus', function(msg, respond) {
    console.log("======Notification Service updateOnlineStatus============================"+msg);
    console.log(msg.userName);

//

    var onlineUserName={
      userName:msg.userName,status:true};
    this.act('role:notification,cmd:getSelectedUserStatus',onlineUserName,function(err,response){
      if(err){
        console.log('error in Connecting notiifcation Microservice');

       }
       // else if(msg.length==0){
      //   console.log('--------------------create--------------');
 

else if(response.response=='null')
      {
        return friends.create({userName:onlineUserName.userName,OnlineStatus:true},function(err,data){
          if(err) { return respond(err); }
          else{
            return respond(null,{msg:data});
            console.log(msg.data);
          }
        });

      }
      else{

        return friends.findOneAndUpdate({userName:msg.userName},
         {$set:{OnlineStatus:msg.OnlineStatus
                 }},function(err, data){
           if(err){return
            console.log("error in getAllNotifications");
            respond(err); 
          }
            else{
              console.log('-----------------------data updated-------------------');
              console.log('************'+data);
              return respond(null,{msg:data});
            }
          });


    }
    // return respond(null,{msg:'data'});
  });
});


}