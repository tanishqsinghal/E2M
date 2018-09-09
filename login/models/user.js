var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://tan:tankit@ds117540.mlab.com:17540/mean-demo');

var db = mongoose.connection;

// User Schema
var UserSchema = mongoose.Schema({
	email: {
		type: String
	},
	password: {
		type: String
	},
	name: {
		type: String
	},
	phone: Number,
	gender: String,
	age: String,
	address: String,
	city: String,
	state: String,
	pin: Number,
	active: Boolean,
	rand: Number
});

var User = module.exports = mongoose.model('users', UserSchema, 'users');

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.getUserByEmail = function(email, callback){
	var query = {email: email};
	User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
	    callback(null, isMatch);
	});
}

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        

	        newUser.save(callback);
	   });   
	});	
}
module.exports.updateUser=function(user,callback){
	user.save(callback);
}

module.exports.resetPass=function(user,callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(user.password, salt, function(err, hash) {
	        user.password = hash;
	        

	        user.save(callback);
	   });   
	});
}

module.exports.getUser = function( callback){
	var query = {};
	User.find(query, callback);
}