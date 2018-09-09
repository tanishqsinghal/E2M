var mongoose = require('mongoose');

mongoose.connect('mongodb://tan:tankit@ds117540.mlab.com:17540/mean-demo');

var db = mongoose.connection;

// User Schema
var NotificationSchema = mongoose.Schema({
	user_id: {
		type: String
	},
	artist_id: {
		type: String
	},
	emanager_id: {
		type: String
	},
	event_id:{
		type:String
	},
	user_actid: {
		type: String
	},
	artist_actid: {
		type: String
	},
	emanager_actid: {
		type: String
	},
	message: {
		type: String
	},
	isread: {
		type: Boolean
	},
	href:{
		type:String
	},
	timestamp:{
		type:Date
	}
});

var Notification = module.exports = mongoose.model('notification', NotificationSchema,'notification');
module.exports.addNewNotification=function(newNotification,callback){
	newNotification.save(callback);
}
module.exports.getNotificationByUserId = function(id, callback){
	Notification.find({user_id:id}).sort({'timestamp':-1}).exec(callback);
}

module.exports.readNotificationByUserId = function(id, callback){
	Notification.updateMany({user_id:id},{$set:{isread:true}}).exec(callback);
}


module.exports.getNotificationByArtistId = function(id, callback){
	Notification.find({artist_id:id,isread:false}).sort({'timestamp':-1}).exec(callback);
}
module.exports.getReadNotificationByArtistId = function(id, callback){
	Notification.find({artist_id:id,isread:true}).sort({'timestamp':-1}).exec(callback);
}

module.exports.readNotificationByArtistId = function(id, callback){
	Notification.updateMany({artist_id:id},{$set:{isread:true}}).exec(callback);
}

module.exports.getNotificationByEmanagerId = function(id, callback){
	Notification.find({emanager_id:id}).sort({'timestamp':-1}).exec(callback);
}


module.exports.readNotificationByEmanagerId = function(id, callback){
	Notification.updateMany({emanager_id:id},{$set:{isread:true}}).exec(callback);
}