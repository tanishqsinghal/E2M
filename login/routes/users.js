var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var smtpTransport=require("nodemailer-smtp-transport");
var nodemailer=require("nodemailer");
var bcrypt = require('bcryptjs');

var User = require('../models/user');

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

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', {title: 'Register'});
});



router.get('/login', function(req, res, next) {
  res.render('login', {title: 'Login'});
});

router.post('/login',
  passport.authenticate('local', {failureRedirect:'/users/login', failureFlash: 'Invalid username or password'}),
  function(req, res) {
    req.flash('success', 'Login Successful');
    res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(email, password, done){
  User.getUserByEmail(email, function(err, user){
    if(err) throw err;
    if(!user){
      console.log('Unknown User');
      return done(null, false, {message: 'Unknown User'});
    }
    if(!user.active){
      console.log('Email is not verified');
      return done(null,false,{message:'Email is not verified'});
    }

    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        console.log('SET');
        return done(null, user);
      }else{
        console.log('Invalid Password');
        return done(null, false, {message: 'Invalid Password'});
      }
    });
  });
}));
router.get('/verify',function(req,res){
       let decodedMail = new Buffer(req.query.mail, 'base64').toString('ascii');
     var query = User.findOne({ 'email': decodedMail});

// selecting the   `active` and `rand` fields
    query.select('active rand');

// execute the query at a later time
    var rand;
    query.exec(function (err, user) {
  if (err) return handleError(err);
  if(!user)
  {
    res.send("corrupted link try to register again");
    return;
  }
  else{
    if(user.active){
        //res.send("email is already verified");
        req.flash('success', 'Email is Already Verified');
        res.location('/');
        res.redirect('/');
      }
    else
       { rand=user.rand;
            if(req.query.id==rand)
            {
                var query = { 'email': decodedMail };
                user.active=true;
                user.rand=undefined;
                user.save(function(err){
                    if(err)
                        res.end("some error occured try after some time");
                    else
                    {
                        console.log("email is verified");
                        //res.send("<h1>Email "+decodedMail+" is been Successfully verified");
                        req.flash('success', 'Email has been Successfully Verified');
                        res.location('/');
                                  res.redirect('/');
                    }

                });

            }
            else
            {
                console.log("email is not verified");
                res.end("<h1>Bad Request</h1>");
            }
       }
    }
  });
});
router.post('/register', upload.single('profileimage'), function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;

  // Form Validation
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password field is required').notEmpty();

  // Check Errors
  var errors = req.validationErrors();

  if(errors){
  	res.render('register', {
  		errors: errors
  	});
  }else{
  	var newUser = new User({
      name: name,
  		email: email,
      password: password,
      active: false,
      rand: Math.floor((Math.random() * 100) + 54)
  	});

          User.getUserByEmail(newUser.email, function(err,user){
            if(err)
                throw err;
            if(user)
                {
                    if(user.active)
                    res.send("email already exist");
                    else{
                        res.send("verification is pending");
                        res.location('/');
                                  res.redirect('/');
                      }
                      return;
                } 
                else
                {
                    User.createUser(newUser, function(err, user){
                      if(err) throw err;
                                      host=req.get('host');
                                var encodedMail = new Buffer(newUser.email).toString('base64');
                                link="http://"+req.get('host')+"/users/verify?mail="+encodedMail+"&id="+newUser.rand;
                             var   mailOptions={
                                    to : newUser.email,
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
                      console.log(user);
                    });

                }
               
          });


  }
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'Logout Successful');
  res.redirect('/users/login');
});
module.exports = router;
