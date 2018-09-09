var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://tan:tankit@ds117540.mlab.com:17540/mean-demo');

var db = mongoose.connection;

// User Schema
var ArtistSchema = mongoose.Schema({
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
	instid: String,
	instname: String,
	active: Boolean,
	count:Number,
	rand: Number,
	photos: Array
});

var Artist = module.exports = mongoose.model('artists', ArtistSchema, 'artists');

module.exports.getArtistByCategory = function(category, callback){
	var query = {sub_category:category};
	Artist.find(query, callback);
}

module.exports.getArtistById = function(id, callback){
	Artist.findById(id, callback);
}

module.exports.getArtistByEmail = function(email, callback){
	var query = {email: email};
	Artist.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
	    callback(null, isMatch);
	});
}

module.exports.getArtistByFilters=function(category,body,callback)
{
	var query=Artist.find({sub_category:category});
	if(body.city!="all")
		query=query.where({city:body.city});
	if(body.ratingsort!=0)
		query=query.sort({rating:body.ratingsort});
	if(body.namesort!=0)
		query=query.sort({name:body.namesort});
	query.exec(callback);
}

module.exports.createArtist = function(newArtist, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newArtist.password, salt, function(err, hash) {
	        newArtist.password = hash;
	        

	        newArtist.save(callback);
	   });   
	});	
}
module.exports.updateArtist=function(artist,callback){

	
	artist.save(callback);
}

module.exports.resetPass=function(artist,callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(artist.password, salt, function(err, hash) {
	        artist.password = hash;
	        

	        artist.save(callback);
	   });   
	});
}

module.exports.getArtist = function( callback){
	var query = {};
	Artist.find(query, callback);
}