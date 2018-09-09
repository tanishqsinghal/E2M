var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://tan:tankit@ds117540.mlab.com:17540/mean-demo');

var db = mongoose.connection;

// User Schema
var InstitutesSchema = mongoose.Schema({
	email:String,
	password:String,
	phone:Number,
	name:String,
	gender:String,
	age:Number,
	address:String,
	city:String,
	state:String,
	rating: Number,
	qualification:String,
	specialization:String,
	sub_category:String,
	small_description:String,
	pin:Number,
	website_link:String,
	photo:String,
	active: Boolean,
	count:Number,
	rand: Number
});

var Institute = module.exports = mongoose.model('institutes', InstitutesSchema, 'institutes');

module.exports.createInstitute = function(newInstitute, callback){	        

	        newInstitute.save(callback);
	  
}

module.exports.getInstitute = function( callback){
	var query = {};
	Institute.find(query, callback);
}


module.exports.getInstituteByName = function(name, callback){
	var query = {name: name};
	Institute.findOne(query, callback);
}

module.exports.getInstituteById = function(id, callback){
	Institute.findById(id, callback);
}