var mongoose = require('mongoose');

mongoose.connect('mongodb://tan:tankit@ds117540.mlab.com:17540/mean-demo');

var db = mongoose.connection;

// User Schema
var TaskSchema = mongoose.Schema({
	event_id:{
		type:String
	},
	artists:{
		type:Array
	},
	name:{
		type:String
	},
	description:{
		type:String
	},
	complete:{
		type:Boolean
	}
});

var Task = module.exports = mongoose.model('task', TaskSchema,'task');

module.exports.addNewTask=function(newTask,callback){
	newTask.save(callback);
}
module.exports.getTaskByEventId = function(id, callback){
	Task.find({event_id:id}).exec(callback);
}

module.exports.getTaskById = function(id, callback){
	Task.findById(id, callback);
}
module.exports.finishTask = function(id, callback){
	Task.where({ _id: id }).update({$set:{complete:true}}).exec(callback);
}