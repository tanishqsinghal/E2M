var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var smtpTransport=require("nodemailer-smtp-transport");
var nodemailer=require("nodemailer");
var bcrypt = require('bcryptjs');

var Artist = require('../models/artist');


/*
    Here we are configuring our SMTP Server details.
    STMP is mail server which is responsible for sending and recieving email.
*/
var transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host:'smtp.gmail.com' ,
  auth: {
    //xoauth2: xoauth2.createXOAuth2Generator({
    user: 'tsinghal544@gmail.com',
        pass: "tsinghal544"
    //})
  },
  tls: {
        rejectUnauthorized: false
    }
}));
var mailOptions,host,link;
/*------------------SMTP Over-----------------------------*/


router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/',function (req,res){
  Artist.getArtistById(req.body.id,function(err,artist){
    if(err){ 
      console.log('JGFGHVGH');
      throw err}
    else
    {
      console.log('ArT');
      res.render('artist',{artist:artist});
    }
  });
});

/*router.get('/registerartist', function(req, res, next) {
  res.render('registerartist', {title: 'Artist Sign Up'});
});*/

router.post('/registerartist', function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var catagory = req.body.catagory;
  var password = req.body.password;
  var gender  = req.body.gender;
  var age = req.body.age;
  var address = req.body.address;
  var city = req.body.city;
  var state = req.body.state;
  var qualification = req.body.qualification;
  var specialization = req.body.specialization;
  var bio = req.body.bio;
  var pin = req.body.pin;
  var link = req.body.link;
  var phone = req.body.phone;


  // Form Validation
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('catagory', 'Choose a catagory').notEmpty();
  req.checkBody('password', 'Password field is required').notEmpty();

  // Check Errors
  var errors = req.validationErrors();
  if(errors){
  	console.log('ERRRR');
  	res.render('/', {
  		errors: errors
  	});
  }else{
  	var newArtist = new Artist({
      	email: email,
		password: password,
		phone: phone,
		name: name,
		gender: gender,
		age: age,
		address: address,
		city: city,
		state: state,
		//Rating: undefined,
		qualification: qualification,
		specialization: specialization,
		sub_category: catagory,
		small_description: bio,
		pin: pin,
		website_link: link,
		//Photo: undefined,
      active: false,
      rand: Math.floor((Math.random() * 100) + 54)
  	});

  /*	Artist.createArtist(newArtist, function(err, artist){
		if(err) throw err 
		console.log(artist); 		
  	});

  	res.location('/');
  	res.redirect('/');
*/
          Artist.getArtistByEmail(newArtist.email, function(err, artist){
            if(err){
                throw err;
            }
            if(artist)
                {
                	console.log(newArtist.email);
                	console.log(artist);
                    if(artist.active)
                    res.send("email already exist");
                    else{
                        res.send("verification is pending");
                       // res.location('/');
                       //res.redirect('/');
                      }
                      return;
                } 
                else
                {
                	console.log("hello");
                    Artist.createArtist(newArtist, function(err, artist){
                    	console.log("before");
                      if(err) throw err;
                      console.log("after");
                                      host=req.get('host');
                                var encodedMail = new Buffer(newArtist.email).toString('base64');
                                link="http://"+req.get('host')+"/Artists/verify?mail="+encodedMail+"&id="+newArtist.rand;
                             var   mailOptions={
                                    to : newArtist.email,
                                    subject : "Please confirm your Email account",
                                    html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
                                }
                                console.log(mailOptions);
                                transporter.sendMail(mailOptions, function(error, response){
                                if(error){
                                    console.log(error);
                                    res.end("1234");
                                }else{
                                  req.flash('success', 'Message Sent');

                                  res.location('/');
                                  res.redirect('/');
                                    console.log("Message sent: " + response.message);
                                    res.end("sent");
                                }
                                });
                      console.log(artist);
                    });

                }
               
          });


  }
});

module.exports = router;