var mongoose = require('mongoose');


mongoose.connect('mongodb://tan:tankit@ds117540.mlab.com:17540/mean-demo');

var db = mongoose.connection;
var ObjectId = mongoose.Schema.ObjectId;
// User Schema
var EventSchema = mongoose.Schema({
	user_id: {
		type: String
	},
	artist_id: {
		type: String
	},
	artist_name:{
		type:String
	},
	artist_phone:{
		type:Number
	},
	artist_email:{
		type:String
	},
	artist_gender:{
		type:String
	},
	artist_category:{
		type:String
	},
	emanager_id: {
		type: String
	},
	emanager_name:{
		type:String
	},
	emanager_phone:{
		type:Number
	},
	emanager_email:{
		type:String
	},
	emanager_gender:{
		type:String
	},
	user_name:{
		type:String
	},
	user_phone:{
		type:Number
	},
	user_email:{
		type:String
	},
	user_gender:{
		type:String
	},
	user_type:{
		type:String
	},
	user_address:{
		type:String
	},
	user_city:{
		type:String
	},
	user_state:{
		type:String
	},
	user_pin:{
		type:Number
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
	},
	review:{
		type:String
	},
	rating:{
		type:Number
	},
	event_id:{
		type:String
	}

});

var Event = module.exports = mongoose.model('events', EventSchema,'events');


module.exports.getEventById = function(id, callback){
	Event.findById(id, callback);
}

module.exports.getEventByUserId = function(id, callback){
	Event.find({user_id:id}).sort({'timestamp':-1}).exec(callback);
}

module.exports.getEventByEventId = function(id, callback){

	Event.find({event_id:id}).sort({'timestamp':-1}).exec(callback);
}
module.exports.updateEvents = function(id, callback){

	Event.updateMany({event_id:id},{$set:{status:"review"}}).exec(callback);
}


module.exports.getEventByArtistId = function(id, callback){
	var date=new Date();
	Event.find({artist_id:id,active:true}).sort({'timestamp':-1}).exec(callback);
}

module.exports.getPastEventByArtistId = function(id, callback){
	var date=new Date();
	Event.find({artist_id:id,active:false}).limit(10).sort({'timestamp':-1}).exec(callback);
}

module.exports.getEventByEmanagerId = function(id, callback){
	var date=new Date();
	Event.find({"emanager_id":id,"active":true}).sort({'timestamp':-1}).exec(callback);
	//Event.aggregate([{"$match":{"emanager_id":id,"active":true}},{"$lookup":{"from":"events","localField":"_id","foreignField":"event_id","as":"artist"}}]).sort({'timestamp':-1}).exec(callback);
}
module.exports.getPastEventByEmanagerId = function(id, callback){
	var date=new Date();
	Event.find({"emanager_id":id,"active":false}).limit(10).sort({'timestamp':-1}).exec(callback);
	//Event.aggregate([{"$match":{"emanager_id":id,"active":true}},{"$lookup":{"from":"events","localField":"_id","foreignField":"event_id","as":"artist"}}]).sort({'timestamp':-1}).exec(callback);
}


module.exports.createEvent=function(newEvent,callback){

	
	newEvent.save(callback);
}
module.exports.checkDate=function(start_date,end_date,artist_id,callback){
	console.log(start_date,end_date);
	Event.find({artist_id:artist_id,status:"active",active:true}).or([{"start_date":{"$gte":start_date,"$lte":end_date}},{"end_date":{"$gte":start_date,"$lte":end_date}}]).exec(callback);
	
}
module.exports.checkDateEmanager=function(start_date,end_date,emanager_id,callback){
	console.log(start_date,end_date);
	Event.find({emanager_id:emanager_id,status:"active",active:true}).or([{"start_date":{"$gte":start_date,"$lte":end_date}},{"end_date":{"$gte":start_date,"$lte":end_date}}]).exec(callback);
	
}

module.exports.updateEvent=function(event,callback){
	event.save(callback);
}

module.exports.getEvent = function( callback){
	var query = {};
	Event.find(query, callback);
}
