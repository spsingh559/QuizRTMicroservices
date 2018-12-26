var controller = {};

var context = require('../../context');
var mesh = context.mesh;

controller.getAllNotification = function(req, res) {
  console.log("username in controller",req.param("username"));
  const NotificationData = {
    username :req.param("username")

  };
   mesh.act('role:notification,cmd:getAllNotification',NotificationData,function(err,response){
    if(err){
      console.log('error in Connecting notiifcation Microservice');
      // res.send(err);
    }else{
      console.log("notification Microservice connected");
       console.log(response);
      res.send(response);
    }
  });
};
controller.getNotification = function(req, res) {
  console.log("username in controller**********************");
  var data = {
        "NotificationData": {
            "username": req.params.username,
            "Id": req.params.NotificationId
        }
    }; 
console.log(data.NotificationData.username);
mesh.act('role:notification,cmd:getSelectedNotification',data,function(err,response){
    if(err){
      console.log('error in Connecting notiifcation Microservice');
      // res.send(err);
    }else{
      console.log("notification Microservice connected***********");
      console.log(response);
      res.send(response);
    }
  });
  
};
controller.updateNotification = function(req, res) {
const updateData=req.body;
  console.log("updatedata in controller================"+updateData.updateOBj);
  mesh.act('role:notification,cmd:update', updateData, function(err, response) {
    if(err){
      console.log('error in Connecting notiifcation Microservice');
      console.log(err);
      // res.send(err);
    }else{
      console.log("notification Microservice connected");
       // console.log(response);
      res.send(response);
    }
  });
};



exports = module.exports = controller;
