var mongoose = require('mongoose');

mongoose.connect('mongodb://tan:tankit@ds117540.mlab.com:17540/mean-demo');

var db = mongoose.connection;

// User Schema
var ArtistSchema = mongoose.Schema({
	Email:String,
Password:String,
Phone:Number,
Name:String,
Gender:String,
Age:Number,
Address:String,
City:String,
State:String,
Rating:String,
Qualification:[String],
Specialization:[String],
Sub_category: [String],
Small_description:String,
Pin:Number,
Website_link:String,
Photo:String
});

var Artist = module.exports = mongoose.model('artists', ArtistSchema,'artists');

module.exports.getArtistByCategory = function(category, callback){
	var query = {Sub_category:category};
	Artist.find(query, callback);
}