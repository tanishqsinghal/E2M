var express = require('express');
var router = express.Router();

var Artist = require('../models/artist');

router.get('/search', function(req, res, next) {
  var q = [
        { 'catagory': { $regex: new RegExp(keyword, "i") } }
    ];
    
    Artist.find({ $or: query }, function(err, results){

    	res.json(data);});

  /*Artist.find({
  	catagory: {
  		$regex: new RegExp(q)
  	}
  	}, {
  		_id: 0,
  		__v: 0
  	}, function(err, data) {
  		res.json(data);
  	}).limit(10);*/

});

module.exports = router;