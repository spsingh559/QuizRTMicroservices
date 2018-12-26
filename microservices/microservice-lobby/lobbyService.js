var seneca = require('seneca')();

  seneca
  .use('./lobbyPlugin.js')
  .use('mesh', { pin:'role:lobby,action:*'})