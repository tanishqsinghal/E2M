var mongoose = require('mongoose');


mongoose.connect('mongodb://tan:tankit@ds117540.mlab.com:17540/mean-demo');

var db = mongoose.connection;

// User Schema
var EventSchema = mongoose.Schema({
	user_id: {
		type: String
	},
	artist_id: {
		type: String
	},
	start_date: {
		type: Date
	},
	end_date: {
		type: Date
	},
	status:{
		type:String
	},
	address:{
		type:String
	},
	active:{
		type:Boolean
	},
	details:{
		type:String
	},
	timestamp:{
		type:Date
	}
});

var Event = module.exports = mongoose.model('events', EventSchema,'events');


module.exports.getEventById = function(id, callback){
	Event.findById(id, callback);
}

module.exports.getEventByUserId = function(id, callback){
	Event.findone(id, callback);
}


module.exports.getEventByArtistId = function(id, callback){
	var date=new Date();
	Event.find({artist_id:id,active:true}).sort({'timestamp':-1}).exec(callback);
}

module.exports.createEvent=function(newEvent,callback){

	
	newEvent.save(callback);
}
module.exports.checkDate=function(start_date,end_date,artist_id,callback){
	console.log(start_date,end_date);
	Event.find({artist_id:artist_id,status:"active",active:true}).or([{"start_date":{"$gte":start_date,"$lte":end_date}},{"end_date":{"$gte":start_date,"$lte":end_date}}]).exec(callback);
	
}

module.exports.updateEvent=function(event,callback){
	event.save(callback);
}
