var express = require('express');
var router = express.Router();
var Category= require('../models/category');

/* GET home page. */
router.get('/', /*ensureAuthenticated,*/ function(req, res) {
	
			if(!req.session.page_views){
				req.session.page_views = 1;
				req.session.active = false;
				req.session.actart = false;
				req.session.arid = undefined;
				req.session.userid = undefined;
				req.session.emid = undefined;
				req.session.actem = false;
				req.session.event_id = undefined;
				req.session.actadmin=undefined;
			}


			//console.log(categories);
			console.log(req.session);
			res.render('index', { title: 'E2M', chart: req.session.actart, chem: req.session.actem});
		
  
});

module.exports = router;