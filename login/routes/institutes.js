var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var smtpTransport=require("nodemailer-smtp-transport");
var nodemailer=require("nodemailer");
var bcrypt = require('bcryptjs');
var session = require('express-session');

var Artist = require('../models/artist');
var Event=require('../models/event');
var User = require('../models/user');
var Emanager = require('../models/emanager');
var Category= require('../models/category');
var Notification=require('../models/notification');
var Institute = require('../models/institute');

var router = express.Router();

router.post('/findinstitute', function(req, res, next) {
  var instid = req.body.instid;
  console.log(req.body.instid);
  Institute.getInstituteById(instid, function(err, institute)
      {     
        if(err)
          throw err;
        else
          {
            institute.count += 1;
            Institute.createInstitute(institute,function (err, updatedInstitute) {
              if (err) return handleError(err);
              console.log('count update');
              console.log(updatedInstitute);
              res.render('inst', {institute:institute, admin: req.session.actadmin}); 
            });
            
          }
    });
});
router.get('/name',function(req,res){
  Institute.getInstitute(function(err,institutes){
    if(err) throw err;
      res.json({"institutes":institutes});
  });
});

router.get('/dashboard', function(req, res, next) {
  var artistss = undefined;
    var categoriess = undefined;
    var emanagerss = undefined;
    var institutess = undefined;
    var userss = undefined;


    Artist.getArtist(function(err,artists)
      {     
        if(err)
          throw err;
        else
          {

            artistss = artists;
            Category.getCategories(function(err,categories)
              {     
                if(err)
                  throw err;
                else
                  {
                    categoriess = categories;
                    Emanager.getEmanagers(function(err,emanagers)
                      {     
                        if(err)
                          throw err;
                        else
                          {

                            emanagerss = emanagers;
                            Institute.getInstitute(function(err,institutes)
                              {     
                                if(err)
                                  throw err;
                                else
                                  {

                                    institutess = institutes;
                                    User.getUser(function(err,users)
                                      {     
                                        if(err)
                                          throw err;
                                        else
                                          {

                                            userss = users;
                                            if (req.session.actadmin) {
                                            res.render('adminpanel', {artists: artistss, categories: categoriess, emanagers: emanagerss, institutes: institutess, users: userss});
                                            }
                                            else{
                                              res.render('institute', {institutes: institutess});
                                            }
                                          }
                                    });
                                  }
                            });
                          }
                    });
                  }
            });
          }
    });
});

router.post('/updateInstitute', function(req, res, next) {
  Institute.getInstituteById(req.body.instid, function (err, institute) {
    if (err) throw err;
    institute.name = req.body.name;
    institute.address = req.body.address;
    institute.city = req.body.city;
    institute.state = req.body.state;
    institute.small_description = req.body.bio;
    institute.pin = req.body.pin;
    institute.website_link = req.body.link;
    Institute.createInstitute(institute,function (err, updatedInstitute) {
              if (err) return handleError(err);
              console.log('count update');
              console.log(updatedInstitute);
              res.render('inst', {institute:institute, admin: req.session.actadmin}); 
            });
  });
});

router.post('/addinstitute', function(req, res, next) {

	var newInstitute = new Institute({
    name: req.body.name,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    small_description: req.body.bio,
    pin: req.body.pin,
    website_link: req.body.link,
    count: 0
    });


  Institute.createInstitute(newInstitute, function(err, institute){
  	if(err){ throw err;}
  	else{
  		console.log('Institute Added');
  		//res.render('institute',{institute:institute});
  		res.redirect('/institutes/dashboard');

  		

  	}
  });
});

module.exports = router;