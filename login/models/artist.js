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
rating:String,
qualification:String,
specialization:String,
sub_category:String,
small_description:String,
pin:Number,
website_link:String,
photo:String
});

var Artist = module.exports = mongoose.model('artists', ArtistSchema);

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

module.exports.createArtist = function(newArtist, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newArtist.password, salt, function(err, hash) {
	        newArtist.password = hash;
	        

	        newArtist.save(callback);
	   });   
	});	
}