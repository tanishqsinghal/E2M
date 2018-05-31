var mongoose = require('mongoose');

mongoose.connect('mongodb://tan:tankit@ds117540.mlab.com:17540/mean-demo');

var db = mongoose.connection;

// User Schema
var CategorySchema = mongoose.Schema({
	category: {
		type: String
	},
	tags:Array
});

var Category = module.exports = mongoose.model('category', CategorySchema,'category');

module.exports.getCategory = function( callback){
	Category.find({}).select({category:1,tags:1,_id:0}).exec(callback);
}
