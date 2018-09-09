var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://tan:tankit@ds117540.mlab.com:17540/mean-demo');

var db = mongoose.connection;

// User Schema
var EmanagerSchema = mongoose.Schema({
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
	instid: String,
	instname: String,
	photo:String,
	active: Boolean,
	count:Number,
	rand: Number,
	photos: Array
});

var Emanager = module.exports = mongoose.model('emanagers', EmanagerSchema, 'emanagers');

module.exports.getEmanager= function( callback){
	var query = {};
	Emanager.find(query, callback);
}

module.exports.getEmanagerById = function(id, callback){
	Emanager.findById(id, callback);
}

module.exports.getEmanagerByEmail = function(email, callback){
	var query = {email: email};
	Emanager.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
	    callback(null, isMatch);
	});
}

module.exports.getEmanagerByFilters=function(category,body,callback)
{
	var query=Emanager.find({sub_category:category});
	if(body.city!="all")
		query=query.where({city:body.city});
	if(body.ratingsort!=0)
		query=query.sort({rating:body.ratingsort});
	if(body.namesort!=0)
		query=query.sort({name:body.namesort});
	query.exec(callback);
}

module.exports.createEmanager = function(newEmanager, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newEmanager.password, salt, function(err, hash) {
	        newEmanager.password = hash;
	        

	        newEmanager.save(callback);
	   });   
	});	
}
module.exports.updateEmanager=function(emanager,callback){

	
	emanager.save(callback);
}

module.exports.resetPass=function(emanager,callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(emanager.password, salt, function(err, hash) {
	        emanager.password = hash;
	        

	        emanager.save(callback);
	   });   
	});
}


module.exports.getEmanagers = function( callback){
	var query = {};
	Emanager.find(query, callback);
}