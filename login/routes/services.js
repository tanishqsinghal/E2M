var express = require('express');
var router = express.Router();
var session = require('express-session');

var Artist = require('../models/artist');
var User = require('../models/user');
var filter={namesort:0,city:"all",ratingsort:0};

router.get('/:category', function(req, res) {
	Artist.getArtistByCategory(req.params.category,function(err,artists)
		{
			
			  
			    
			  
			
			if(err)
				throw err;
			else
				{
					console.log(artists);

					res.render('service', { title: 'E2M' , filter:filter, artist: artists, category: req.params.category});

				}
		});
			

 	 
});


router.post('/:category', function(req, res) {
	console.log(req.body);
	console.log(req.params.category);
	Artist.getArtistByFilters(req.params.category,req.body,function(err,artists)
		{
			if(err)
				throw err;
			else
				{
					
					filter.city=req.body.city;
					filter.namesort=req.body.namesort;
					filter.ratingsort=req.body.ratingsort;
					console.log(filter);
					res.render('service', { title: 'E2M' , filter:filter, artist: artists, category: req.params.category});

				}
		});

 	 
});

module.exports= router;