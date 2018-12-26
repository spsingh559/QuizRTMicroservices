var mongoose = require('mongoose');


var Schema = mongoose.Schema;

var FriendSchema = new Schema({
    userName:{type:String},
    OnlineStatus:{type:Boolean}    
});

module.exports = mongoose.model('friends', FriendSchema);
