var express = require('express');
var router = express.Router();
var Category= require('../models/category');

/* GET home page. */
router.get('/', /*ensureAuthenticated,*/ function(req, res, next) {
	Category.getCategory(function(err,categories)
	{
		if(err) throw err;
		else{

			if(!req.session.page_views){
				req.session.page_views = 1;
				req.session.active = false;
				req.session.actart = false;
				req.session.arid = undefined;
				req.session.userid = undefined;
			}


			//console.log(categories);
			console.log(req.session);
			res.render('index', { title: 'E2M',category:categories, chart: req.session.actart});
		}

	});
  
});

/*function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		req.session.active=true;
		return next();
	}
	req.session.active=false;
	//res.redirect('/users/login');
}*/

module.exports = router;