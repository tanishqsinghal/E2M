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

router.get('/login', function(req, res, next) {
  res.render('adminlogin');
});
router.get('/dashboard',function(req,res){
	if(req.session.actadmin==false || !req.session.actadmin)
	{
		res.render('adminlogin');
	}
	Artist.getArtist(function(err,artists){
		if(err) throw err;
		res.render('adminpanel', {artists: artists });
	});
});

router.get('/categories',function(req,res){
	if(req.session.actadmin==false || !req.session.actadmin)
	{
		res.render('/admin/login');
	}
	Category.getCategories(function(err,categories){
		if(err) throw err;
		res.json({categories:categories});
	});
});
router.get('/emanagers',function(req,res){
	if(req.session.actadmin==false || !req.session.actadmin)
	{
		res.render('/admin/login');
	}
	Emanager.getEmanagers(function(err,emanagers){
		if(err) throw err;
		res.json({emanagers:emanagers});
	});
});
router.get('/users',function(req,res){
	if(req.session.actadmin==false || !req.session.actadmin)
	{
		res.render('/admin/login');
	}
	User.getUser(function(err,users){
		if(err) throw err;
		res.json({users:users});
	});
});
router.get('/institutes',function(req,res){
	if(req.session.actadmin==false || !req.session.actadmin)
	{
		res.render('/admin/login');
	}
	Institute.getInstitute(function(err,institutes){
		if(err) throw err;
		res.json({institutes:institutes});
	});
});
router.post('/loginadmin', function(req, res, next) {
  if(req.body.name == 'admin321' && req.body.password == 'admin@321')
  {
  	
  	req.session.actadmin=true;
  	res.redirect('/admin/dashboard')

  }
  else
  {
  	console.log('You Are Not Admin');
  	res.send("You Are Not Admin");
  }
});

router.get('/logout', function(req, res){
  req.logout();
  req.session.actadmin=false;
  res.redirect('/');
});


module.exports = router;