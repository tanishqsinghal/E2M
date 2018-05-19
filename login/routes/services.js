var express = require('express');
var router = express.Router();

var Artist = require('../models/artist');

router.get('/:category', function(req, res) {
	Artist.getArtistByCategory(req.params.category,function(err,artists)
		{
			if(err)
				throw err;
			else
				{
					console.log(artists);
					res.render('service', { title: 'E2M' , artist: artists});

				}
		});

 	 
});
module.exports= router;