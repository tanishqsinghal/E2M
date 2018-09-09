var express = require('express');
var router = express.Router();
var session = require('express-session');

var Artist = require('../models/artist');
var User = require('../models/user');
var Emanager=require('../models/emanager');
var Category= require('../models/category');
var filter={namesort:0,city:"all",ratingsort:0};
router.get('/all_category',function(req,res){
	Category.getCategory(function(err,categories){
		if(err) throw err;
		res.json({"category":categories});
	});
});
router.get('/:category', function(req, res) {
	console.log(req.params.category);
	if(req.query.event_id){req.session.event_id=req.query.event_id;}
	if(req.params.category=="event manager")
	{
		Emanager.getEmanager(function(err,artists)
			{			
				if(err)
					throw err;
				else
					{

						res.render('service', { title: 'E2M' , filter:filter, artist: artists, category: req.params.category});
					}
		});	
	}
	else
	{
		Artist.getArtistByCategory(req.params.category,function(err,artists)
			{			
				if(err)
					throw err;
				else
					{

						res.render('service', { title: 'E2M' , filter:filter, artist: artists, category: req.params.category});
					}
		});
	}
 	 
});


router.get('/:category/filter', function(req, res) {
	if(req.params.category=="event manager")
	{
		Emanager.getEmanagerByFilters(req.query,function(err,artists)
			{			
				if(err)
					throw err;
				else
					{
						filter.city=req.query.city;
						filter.namesort=req.query.namesort;
						filter.ratingsort=req.query.ratingsort;
						console.log(filter);
						res.render('service', { title: 'E2M' , filter:filter, artist: artists, category: req.params.category});
					}
		});	
	}
	else
	{
	Artist.getArtistByFilters(req.params.category,req.query,function(err,artists)
		{
			if(err)
				throw err;
			else
				{
					
					filter.city=req.query.city;
					filter.namesort=req.query.namesort;
					filter.ratingsort=req.query.ratingsort;
					console.log(filter);
					res.render('service', { title: 'E2M' , filter:filter, artist: artists, category: req.params.category});

				}
		});
	}		
 	 
});

module.exports= router;