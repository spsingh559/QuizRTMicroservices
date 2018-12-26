var seneca = require('seneca')();

var notificationMicroservicePlugin = require('.');
 // var env = process.env.NODE_ENV || 'dev';
 
  seneca
  .use(notificationMicroservicePlugin, {
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/notificationDB'
	})
  .use('mesh', { auto:true, pin:'role:notification,cmd:*'})