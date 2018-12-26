var seneca = require('seneca');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var request = require('request');
var path = require('path');

const PlayerMiddleware = require('./player-middleware/index');


var cloudinary = require('cloudinary');
var formidable = require('express-formidable');
var secret = process.env.AUTH_SECRET || "the matrix";
var googlecredentials = require('./secrets/googlecredentials');
var oauth2Client = new OAuth2(googlecredentials.CLIENT_ID, googlecredentials.CLIENT_SECRET, googlecredentials.REDIRECT_URL);
var redirectHost = process.env.REDIRECT_HOST || "localhost";
var port = process.env.PORT || '8001';
var redirectPort = process.env.REDIRECT_PORT || port;
// var redirectPort = 8001;
// var redirectHost = "192.168.99.101";
var name = process.env.NAME || "default";
var mesh = seneca({log: 'test'});
mesh.use('mesh',{auto:true});
var context = require('./context');

var cloudinary = require('cloudinary');
var formidable = require('express-formidable');

var chatMiddlewarePlugin  = require('./chatmiddlewareplugin');
var notificationMiddlewarePlugin=require('./notificationMiddlewarePlugin');
var lobbyMiddlewarePlugin=require('./lobbyMiddlewarePlugin');

context.mesh = mesh;
var twitterStream = require('./api/timeline/TwitterStream');

context.authorizeMiddleware = function(req, res, next) {
  mesh.act('role:jwt,cmd:verify', {token: req.get('JWT')}, function(err, response) {
    if(err) { return res.status(500).json(err); }
    if(response.response !== 'success') { return res.status(404).send(); }
    req.claims = response.claims;
    next();
  });
};

/*var schedular = require('./schedular');
schedular();*/

var env = process.env.NODE_ENV || 'dev';

app.use(express.static(path.join(__dirname,'..','common-ui')));

if(env.trim() === 'dev') {
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, jwt");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH");
    // console.log("inside server checking env",env);
    next();
  });
};

app.use(require('body-parser').json());
app.set('secret',secret);
app.use('/api/v1', require('./router'));

var chat = io.of('/chat');

app.post('/api/generateuuid/uuid',function(req,res){
  const redis=require('redis');
  const publisher=redis.createClient(6379,'172.23.238.253');
  const subscriber=redis.createClient(6379,'172.23.238.253');
  subscriber.subscribe(req.body.message.content);
  publisher.publish('ChatService2',JSON.stringify(req.body));
  subscriber.on('message',function(channel,message){
    var message1=JSON.parse(message);
    res.send({response:'success',result:message1});
  });

});


app.use(formidable.parse());
app.post('/api/uploadfile',function(req,res){
console.log('-------------- abc from express floow---------------',req.body);
console.log('-------------- abc from express floow---------------',req.body.file.path);

cloudinary.config({
cloud_name: 'quizrt-social',
api_key: '866928426995948',
api_secret: 'a0_PX4nmJqak_k3lc29Ges5dcNw'
});

cloudinary.uploader.upload(req.body.file.path, function(result) {
console.log(result);
});
});


var tweets =io.of('/tweets');
app.post('/api/authenticate/google',function(req,res,next){
  console.log("Inside Express, inside google login call=======");

  // generate a url that asks permissions for Google+ and Google Calendar scopes
  var scopes = [
    googlecredentials.SCOPE[0],
    googlecredentials.SCOPE[1]
  ];

  var url = oauth2Client.generateAuthUrl({
    access_type: 'online', // 'online' (default) or 'offline' (gets refresh_token)
    scope: scopes,
    approval_prompt: "force" // If you only need one scope you can pass it as string
  });
  res.send({ redirect: url });
  // next();
});

app.get('/api/auth/success/google',function(req,res){
  // console.log("Inside google page===========");
  var code = req.query.code;
  // console.log("Inside Express, code to get Token is=============",code);
  oauth2Client.getToken(code, function(err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    // console.log("Inside Express , after getting token=======",tokens);
    // console.log("Inside Express , after getting token=======",JSON.stringify(tokens));
    if(!err) {
      oauth2Client.setCredentials(tokens);
    }
    if(err){
      console.log(err);
    }

    var access_token = tokens['access_token'];
    var user_profile = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token='+access_token;
      request({
        url: user_profile,
        json: true
      }, function (error, response, body) {
        if (!error) {
          // console.log("Inside the Express after getting the user profile the body is ======",body);
          var tokendata = {
            user : body.email
          }
          // console.log("Inside Express, the user profile token data========,",tokendata);
          mesh.act('role:jwt,cmd:generateGoogleToken',{data:tokendata},function(err,tokenresponse){
            if(err) { return res.status(500).json(err); }
            if(tokenresponse.response==='success'){
              var userObj = {
                username: tokendata.user,
                useravatar :body.picture,
                name : body.given_name,
                age : null,
                country : 'NA',
                totalGames : 0,
                liketopics: '',
                following: 0,
                followers: 0,
                category: 'Beginner'
              };
                mesh.act('role:profile,cmd:create',userObj,function(err,response){
                    if(err) { return res.status(500).json(err); }
                    if(response.response !== 'success') { res.redirect('http://'+redirectHost+':'+redirectPort+'/#/authsuccess/'+tokenresponse.token); }
                    res.redirect('http://'+redirectHost+':'+redirectPort+'/#/authsuccess/'+tokenresponse.token);
                });
            }
          });
      } else {
        res.redirect('/login');
          console.log(error);
      }
    })
  });

});

  tweets.on('connection',function(socket){
  console.log("===conected to tweet socket");
   twitterStream(socket);
});


  chat.on('connection',function(socket){
    console.log("Inside Express, Socket Connected");
    var chatmiddleware = new chatMiddlewarePlugin(socket);
  });


app.get('/topics',function(req,res) {
  console.log('form express-alltopics');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  mesh.act('role:allTopics,action:retrive',function(err,result){
    if (err) return console.error(err)
  console.log('-----------------'+result+'------------------------')
  res.send(result)
  })
  console.log('send');
});
app.get('/api/favouritetopics/user/:userId',function(req,res) {

  result= [{"paras@gmail.com":[
                {  y: 4181563, legendText:"Sherlock", indexLabel: "Sherlock" },
                {  y: 2175498, legendText:"Movies", indexLabel: "Movies" },
                {  y: 3125844, legendText:"Logos",exploded: true, indexLabel: "Logos" },
                {  y: 1176121, legendText:"Sports" , indexLabel: "Sports"},
                {  y: 1727161, legendText:"Cricket", indexLabel: "Cricket" },
                {  y: 4303364, legendText:"General Knowledge" , indexLabel: "General Knowledge"},
                {  y: 1717786, legendText:"Animals" , indexLabel: "Animals"}
            ]},
            {"paras@gmial.com":[
                {  y: 4181564, legendText:"Sherlock", indexLabel: "Sherlock" },
                {  y: 2175498, legendText:"Movies", indexLabel: "Movies" },
                {  y: 3125844, legendText:"Logos",exploded: true, indexLabel: "Logos" },
                {  y: 1176121, legendText:"Sports" , indexLabel: "Sports"},
                {  y: 1727161, legendText:"Cricket", indexLabel: "Cricket" },
                {  y: 4303364, legendText:"General Knowledge" , indexLabel: "General Knowledge"},
                {  y: 1717786, legendText:"Animals" , indexLabel: "Animals"}
            ]}]
  res.send(result[0][req.params.userId])
});


app.get('/topics/myfav',function(req,res) {
 mesh.act('role:myFav,action:retrive',{user:req.params.uid},function(err,result){
 if (err) return console.error(err)
console.log('------------yahi to hai result-----'+result+'------------------------')
res.send(result);
 })
 console.log('agrt dfglca;lkg');
 })

app.get('/api/v1/analytics/user/favTopics',function(req,res) {
  mesh.act('role:analytics,cmd:favouritetopics',function(err,result){
   if (err) return console.error(err)
    console.log('------------testing the result-----'+result+'------------------------')
    res.send(result);
     })
     console.log('agrt dfglca;lkg');
 })

app.get('/api/v1/analytics/user/filter',function(req,res) {
  mesh.act('role:analytics,cmd:favouritetopics',function(err,result){
   if (err) return console.error(err)
    console.log('------------testing the result-----'+result+'------------------------')
    res.send(result);
     })
     console.log('agrt dfglca;lkg');
 })
 app.get('/tournamentSection',function(req,res) {
   console.log('form express-tournamentSection');
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   mesh.act('role:randTournaments,action:retrive',function(err,result){
     if (err) return console.error(err)
   console.log('-----------------'+result+'------------------------')
   res.send(result)
   })
   console.log('send');
 });

 app.get('/tournaments',function(req,res) {
   console.log('form express-alltopics');
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   mesh.act('role:allTournaments,action:retrive',function(err,result){
     if (err) return console.error(err)
   console.log('-----------------'+result+'------------------------')
   res.send(result)
   })
   console.log('send');
 });

// ---------------------------------------------------/
// ------------------------------ LOBBY---------------/
// ---------------------------------------------------/

app.get('/createLobby/:uname', function(req, res) {

  console.log('----------------CREATE LOBBY---------------- ');
  var adminPlayer = req.params.uname;
  var respnse;

  mesh.act('role:lobby,action:createLobbyId', {data: adminPlayer}, function(err,result) {
    if(err)
    {
      console.log('----Error in Connecting with Microservice----');
      console.log(err);
      res.send('error');
    }
    else
    {
      console.log('-----Established connection with Microservice-----');
      console.log(result.gameId);
      respnse = result.gameId;
      console.log('--------------------------------------------------');
      res.send(respnse);
    }
  });
});

app.get('/validateLobby/:lobbyid', function(req, res) {
  var lobbyid = req.params.lobbyid;
  var respnse;
  console.log('In Server to validate Lobby------------------------');
  console.log(lobbyid);
  console.log('---------------------------------------------------');

  mesh.act('role:lobby,action:validateLobby', {data: lobbyid}, function(err,result) {
    if(err)
    {
      console.log('----Error in Connecting with Microservice----');
      console.log(err);
      res.send('error');
    }
    else
    {
      console.log('-----Established connection with Microservice-----');
      console.log(result);
      console.log('--------------------------------------------------');
      res.send(result);
    }
  });
});

//Get Online Friend List
app.get('/onlinePlayerList',function(req,res){
console.log('----------------------online Player List in express');mesh.act('role:notification,cmd:getAllOnlineUserStatus',function(err,response){
   if(err){
     console.log('error in Connecting notiifcation Microservice');
     // res.send(err);
   }else{
     console.log("notification Microservice Online Friend connected");
      console.log(response);
     res.send(response);
   }
 });  // res.send('online List send to Lobby from Express');
});

// app.get('/getLobbyTopic/:lobbyid', function(req, res) {
//   var lobbyid = req.params.lobbyid;
//   var respnse;
//   console.log('In Server to fetch Topic---------------------------');
//   console.log(lobbyid);
//   console.log('---------------------------------------------------');

//   mesh.act('role:lobby,action:getLobbyTopic', {data: lobbyid}, function(err,result) {
//     if(err)
//     {
//       console.log('----Error in Connecting with Microservice----');
//       console.log(err);
//       res.send('error');
//     }
//     else
//     {
//       console.log('-----Established connection with Microservice-----');
//       console.log(result.topic);
//       respnse = result.topic;
//       console.log('--------------------------------------------------');
//       res.send(respnse);
//     }
//   });
// });
// ----------------------------------------------/

app.post('/api/check',function(req,res){
 console.log('-------------- abc from express floow---------------');
 console.log(req.body.incre+'   0----------------------');
 console.log(req.body.id+'    ---------------------');
 var test = {
   id:req.body.id,
   incre:req.body.incre,
   username:req.body.uName
 }

 var username = req.body.uName;

 mesh.act('role:topic,action:like',{data:test},function(err,result){

   if(err) console.log(err+'---------------------------------------done liked---------');

   console.log(result+'yaha thak hai>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
   if(!req.body.incre) {
     mesh.act('role:topic,action:delete',{data:test},function(err,result2){

       if(err) console.log(err+' ========================');

       res.send(result)
     })
   }
 })
});

//---------------Notification--------------------
// app.get('/notifications',function(req,res){
//   // console.log('inside notification server');
//   // res.send('Hello');
//   mesh.act('role:notification,cmd:getAllNotification',function(err,response){
//     if(err){
//       console.log('error in Connecting notiifcation Microservice');
//       // res.send(err);
//     }else{
//       console.log("notification Microservice connected");
//       // console.log(response);
//       res.send(response);
//     }
//   });
// });



app.use(function(req, res) {
  return res.status(404).send();
});



app.use(formidable.parse());
app.post('/api/check',function(req,res){
  console.log('-------------- abc from express floow---------------',req.body);
  //console.log('-------------- abc from express floow---------------',req.body.file);
  console.log('-------------- abc from express floow---------------',req.body.file.path);
  //console.log(req.body.incre+'   0----------------------');
  //console.log(req.body.id+'    ---------------------');

  cloudinary.config({
   cloud_name: 'quizrt-social',
   api_key: '866928426995948',
   api_secret: 'a0_PX4nmJqak_k3lc29Ges5dcNw'
  });
  var url = '';
  cloudinary.uploader.upload(req.body.file.path, function(result) {
    url = result.url;
   console.log(result.url);
  });
  return url;
});

var middleWareCount =0;



io.on('connection',function(socket){
  // TODO: Create Middleware Plugin for user.
  // console.log("socket Connected");
   // socket.emit('connection', {status:true});
   var onlineStatusData={
    onlineStatus:true,
    userName:'spsingh559'
   };
// mesh.act('role:notification,cmd:updateOnlineStatus', {msg: onlineStatusData}, function(err,result) {
//       if(err)
//       {
//         console.log('----Error in Connecting with Microservice (createLobby)----');
//         console.log(err);
//         // res.send('error');
//       }
//       else
//       {
//         console.log('-----Established connection with Microservice (Create Lobby)-----');
//         console.log(result.gameId);
//         respnse = result.gameId;
//         console.log('--------------------------------------------------');
//         // res.send(respnse);
//       }
//     });
// mesh.act(role:notification,cmd:getAllOnlineFriends')

  // mesh.act('role:notification,cmd:getAllOnlineFriends',onlineStatusData,function(err,response){
  //   if(err){
  //     console.log('error in Connecting notiifcation Microservice');
  //     // res.send(err);
  //   }else{
  //     console.log("notification Microservice for get onlinestatus ********connected");
  //      console.log(response);
  //     res.send(response);
  //   }
  // });

// mesh.act('role:notification,cmd:updateOnlineStatus',onlineStatusData,function(err,response){
//     if(err){
//       console.log('error in Connecting notiifcation Microservice');
//       // res.send(err);
//     }else{
//       console.log("notification Microservice for onlinestatus ********connected");
//        console.log(response);
//       res.send(response);
//     }
//   });



  var playerMiddleware;
  var playerId;
  // var NotificationMiddleware;



  socket.on('authenticate', function(jwt) {
    console.log('Retrieved JWT: ', jwt);
    mesh.act('role:jwt,cmd:verify', {token: jwt}, function(err, response) {
      if(err) { return res.status(500).json(err); }
      if(response.response !== 'success') { return socket.emit('authentication','failed'); }
      console.log('Subject: ',response.claims.sub);
      playerId = response.claims.sub;
      console.log("player id is"+playerId);
     
      createPlayerMiddlewareIfNotAlreadyCreated();
    });
  });

  socket.on('notificationSubscriberName',function(msg) {
   var notificationPlayerId=msg.data;
   console.log(' Current Subscriber is ' + msg.data);
var onlineStatusData={
 userName:msg.data,
 OnlineStatus:true
};
mesh.act('role:notification,cmd:updateOnlineStatus',onlineStatusData,function(err,response){
   if(err){
     console.log('error in Connecting notiifcation Microservice');
     // res.send(err);
   }else{
     console.log("notification Microservice for onlinestatus ********connected");
      console.log(response);
     res.send(response);
   }
 });
   var notificationMiddleware = new notificationMiddlewarePlugin(notificationPlayerId,socket);  });
  // var msg='This is notification from'+notificationPlayerId;

  // function NotificationMiddleware(){
  //   notification = new notification(playerId,socket);
  // };

  function createPlayerMiddlewareIfNotAlreadyCreated() {
    if(!playerMiddleware) {
      console.log('Creating Player Middleware');
      playerMiddleware = new PlayerMiddleware(playerId, socket);

      socket.on('disconnect', function() {
        console.log('DISCONNECTING SOCKET!');
        playerMiddleware.close();
      });

      socket.on('playGame', function(msg) {
        console.log('User ' + playerId + ' wants to play a game in topic ' + msg.topicId);
        playerMiddleware.queue(msg.topicId);
      });

      socket.on('respond', function(optionIndex) {
        playerMiddleware.respond(optionIndex);
      });

      playerMiddleware.ready(function() {
        socket.emit('authentication','success');
      });
    }
  }

  
  socket.on('offlineUser',function(msg) {
    var notificationPlayerId=msg.data;
    console.log(' Current Subscriber is ' + msg.data);
    var onlineStatusData={
      userName:msg.data,
      OnlineStatus:false
    };
    mesh.act('role:notification,cmd:updateOnlineStatus',onlineStatusData,function(err,response){
      if(err){
        console.log('error in Connecting notiifcation Microservice');
        // res.send(err);
      }else{
        console.log("notification Microservice for onlinestatus ********connected");
        console.log(response);
        res.send(response);
      }
    });
  // var notificationMiddleware = new notificationMiddlewarePlugin(notificationPlayerId,socket);
  });

  //------------------------------------------------------------------
  // Create Lobby Socket Connections ---------------------------------
  //------------------------------------------------------------------

  const lobbyClient = seneca(); // // var msg={msgs: 'Hello'};

  socket.on('subscribeLobby',function(ldata) {
    var lobbyId = ldata.data.lobbyId;
   
    console.log('--------------- Subscribing --------------------');
    console.log(" LobbyId  is " + lobbyId);
    var lobbyMiddleware = new lobbyMiddlewarePlugin(lobbyId,socket); 
    
    lobbyClient.use('redis-transport');

    lobbyClient.client({
      type: 'redis',
      pin: 'role:lobbySub,lobbyId:'+lobbyId+',cmd:*',
      host: '172.23.238.251'
    });
    console.log(' --- From Server - Subscribed');
  });

  socket.on('unsubscribeLobby',function(ldata) {
    console.log('--------------- Unsubscribing --------------------');
    
    lobbyClient.act('role:lobbySub,lobbyId:'+ldata.lobby+',cmd:unsubscribeToLobby', {data: 'unsub'}, function(err, response) {
      console.log('Response from Middleware : ');
      console.log(response);
    });
    
    //lobbyClient.close();
  });

  socket.on('createLobby',function(ldata)
  {
    console.log('-----------------Reached HTTP-SERVER----------------------');
    console.log(ldata.data.lobby);
    console.log(ldata.data.player);

    mesh.act('role:lobby,action:addLobbyDetails', {data: ldata.data}, function(err,result) {
      if(err)
      {
        console.log('----Error in Connecting with Microservice (createLobby)----');
        console.log(err);
        // res.send('error');
      }
      else
      {
        console.log('-----Established connection with Microservice (Create Lobby)-----');
        console.log(result.gameId);
        respnse = result.gameId;
        console.log('--------------------------------------------------');
        // res.send(respnse);
      }
    });

    console.log('----------------------------------------------------------');
  });

  socket.on('setUserActive',function(playerData)
  {
    console.log('----------Reached HTTP-SERVER (Set Player Active)----------');
    console.log(playerData.data.lobbyId);
    console.log(playerData.data.username);

    mesh.act('role:lobby,action:setActive', {data: playerData.data}, function(err,result) {
      if(err)
      {
        console.log('----Error in Connecting with Microservice (Active)----');
        console.log(err);
        // res.send('error');
      }
      else
      {
        console.log('-----Established connection with Microservice (Active)-----');
        console.log(result.response);
        console.log('--------------------------------------------------');
        // res.send(respnse);
      }
    });

    console.log('----------------------------------------------------------');
  });

  socket.on('leaveLobby',function(playerData)
  {
    console.log('----------Reached HTTP-SERVER (Player Exit)----------');
    console.log(playerData.data.lobby);
    console.log(playerData.data.player);

    mesh.act('role:lobby,action:setLobbyPlayerLeft', {data: playerData.data}, function(err,result) {
      if(err)
      {
        console.log('----Error in Connecting with Microservice (Player Exit)----');
        console.log(err);
        // res.send('error');
      }
      else
      {
        console.log('-----Established connection with Microservice (Player Exit)-----');
        console.log(result);
        console.log('--------------------------------------------------');
        // res.send(respnse);
      }
    });

    console.log('----------------------------------------------------------');
  });


  ///*********************reject
  socket.on('RejectHandle',function(rejectData)
  {
    console.log('----------handle reject (Player Exit)----------');
    console.log('lobbyId     +++++++++++'+rejectData.data.lobby);
    

    mesh.act('role:lobby,action:playerRejected', {data: rejectData.data}, function(err,result) {
      if(err)
      {
        console.log('----Error in Connecting with Microservice (Player rejected)----');
        console.log(err);
        // res.send('error');
      }
      else
      {
        console.log('-----Established connection with Microservice (Player rejected)-----');
        console.log(result);
        console.log('--------------------------------------------------');
        // res.send(respnse);
      }
    });

    console.log('----------------------------------------------------------');
  });

  socket.on('getLobbyDetails',function(ldata)
  {
    console.log('-----------------Reached HTTP-SERVER to get Lobby Details-------');
    console.log(ldata.data);

    mesh.act('role:lobby,action:getAllDetails', {data: ldata.data}, function(err,result) {
      if(err)
      {
        console.log('----Error in Connecting with Microservice (Get all Details)----');
        console.log(err);
        console.log('--------------------------------------------------');
      }
      else
      {
        console.log('-----Established connection with Microservice (Get all Details)-----');
        console.log(result.lobby);

        if(result.lobby == 'invalid')
        {
          socket.emit('invalidLobby', {data: 'error'});
        }
        else
        {
          socket.emit('updatePlayer', {data: result.lobby.players});
          socket.emit('updateTopic', {data: result.lobby.topic});
          socket.emit('updateChat', {data: result.lobby.chat});
          socket.emit('adminUser', {data: result.lobby.admin});
        }
        console.log('--------------------------------------------------');
        // res.send(respnse);
        //socket.emit('updatePlayerList', {data: respnse});
      }
    });

    console.log('----------------------------------------------------------');
  });

  socket.on('lobbyPlayerAdd', function(pdata) {
    console.log('-----------Added ' + pdata.data.player + '------------');
    var newPlayerDetails = pdata.data;
    
    // To Notification Microservice (mesh.act....)

    mesh.act('role:lobby,action:addPlayer', {data: newPlayerDetails}, function(err,result){
      if(err)
      {
        console.log('----Error in Connecting with Microservice (add)----');
        console.log(err);
        // res.send('error');
        console.log('--------------------------------------------------');
      }
      else
      {
        console.log('-----Established connection with Microservice (add)-----');
        console.log(result.players);
        console.log('--------------------------------------------------');
      }
    });

    //Notification add new notification----------------------------------

    var  notificationDetail = {
      type:3,
      senderID:pdata.data.sender,
      targetID:pdata.data.player,
      typeID:pdata.data.lobby,
    };
     
    mesh.act('role:notification,cmd:newNotification',notificationDetail,function(err,response){
      if(err)
      {
        console.log('error in Connecting Add Notification Microservice');
        // res.send(err);
      }
      else
      {
        console.log("notification Microservice Add Notification connected");
        console.log(response);
        res.send(response);
      }
    });
  });

  socket.on('lobbyPlayerDelete', function(pdata) {
    console.log('-----------Removing ' + pdata.data.player + '------------');
    console.log(pdata.data);
    var removePlayerDetails = pdata.data;

    mesh.act('role:lobby,action:remPlayer', {data: removePlayerDetails}, function(err,result){
      if(err)
      {
        console.log('----Error in Connecting with Microservice (remove)----');
        console.log(err);
        console.log('--------------------------------------------------');
      }
      else
      {
        console.log('-----Established connection with Microservice (remove)-----');
        console.log(result.response);
        console.log('--------------------------------------------------');
      }
    });
  });

  socket.on('topicChange', function(topicData) {
    console.log('-----------Change Topic ' + topicData.data.topic + '------------');
    mesh.act('role:lobby,action:changeTop', {data: topicData.data}, function(err,result){
      if(err)
      {
        console.log('----Error in Connecting with Microservice (change Topic)----');
        console.log(err);
        console.log('--------------------------------------------------');
      }
      else
      {
        console.log('-----Established connection with Microservice (change Topic)-----');
        console.log(result.response);
        console.log('--------------------------------------------------');
      }
    });
  });

  socket.on('chatNewMessage', function(chatData) {
    console.log('-----------Message send by ' + chatData.msgData.name + '------------');
    mesh.act('role:lobby,action:chatNewMessage', {data: chatData.msgData}, function(err,result){
      if(err)
      {
        console.log('----Error in Connecting with Microservice (New Message)----');
        console.log(err);
        console.log('--------------------------------------------------');
      }
      else
      {
        console.log('-----Established connection with Microservice (New Message)-----');
        console.log(result.response);
        console.log('--------------------------------------------------');
      }
    });
  });

  socket.on('startGameForLobby', function(data) {
    mesh.act('role:lobby,action:startGame', {lobby: data.lobby}, function(err,result){
      if(err)
      {
        console.log('----Error in Connecting with Microservice (Start Game)----');
        console.log(err);
        console.log('--------------------------------------------------');
      }
      else
      {
        console.log('-----Established connection with Microservice (Start Game)-----');
        console.log(result.response);
        console.log('--------------------------------------------------');
      }
    });
  });

  // -----------------------------------------------------------------
  //------------------------------------------------------------------
});

exports = module.exports = server;