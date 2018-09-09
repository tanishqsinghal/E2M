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

var User = require('../models/user');
var Artist = require('../models/artist');
var Event=require('../models/event');
var Emanager=require('../models/emanager');
var Notfication= require('../models/notification');


//MULTER CONFIG: to get file photos to temp server storage
const multerConfig = {
    
  storage: multer.diskStorage({
   //Setup where the user's file will go
   destination: function(req, file, next){
     next(null, './public/uploads');
     },   
      
      //Then give the file a unique name
      filename: function(req, file, next){
          console.log(file);
          const ext = file.mimetype.split('/')[1];
          next(null, file.fieldname + '-' + Date.now() + '.'+ext);
        }
      }),   
      
      //A means of ensuring only images are uploaded. 
      fileFilter: function(req, file, next){
            if(!file){
              next();
            }
          const image = file.mimetype.startsWith('image/');
          if(image){
            console.log('photo uploaded');
            next(null, true);
          }else{
            console.log("file not supported");
            
            //TODO:  A better message response to user on failure.
            return next();
          }
      }
};

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

router.get('/about', function(req, res, next) {
  res.render('about');
});

router.post('/register', multer(multerConfig).single('profileimage'), function(req, res, next) {
  //console.log("FL :-> "+req.file);
  console.log("NM :-> "+req.body.name);
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var phone = undefined;
  var gender= undefined;
  var age= undefined;
  var address= undefined;
  var city= undefined;
  var state= undefined;
  var pin= undefined;

  // Form Validation
  //req.checkBody('name', 'Name field is required').notEmpty();
  //req.checkBody('email', 'Email field is required').notEmpty();
  //req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password field is required').notEmpty();

  // Check Errors
  var errors = req.validationErrors();

  if(errors){
    console.log(errors);
    res.render('/', {
      errors: errors
    });
  }else{
    var newUser = new User({
      name: name,
      email: email,
      password: password,
      phone: phone,
      gender: gender,
      age: age,
      address: address,
      city: city,
      state: state,
      pin: pin,
      active: false,
      rand: Math.floor((Math.random() * 100) + 54)
    });

          User.getUserByEmail(newUser.email, function(err,user){
            if(err)
                throw err;
            if(user)
                {
                    if(user.active){
                    res.send("email already exist : Login");
                    //req.flash('success', 'Email already exist : Login');
                    //res.location('/');
                    //res.redirect('/login');

                    }
                    else{
                        res.send("verification is pending");
                        //res.location('/');
                          //        res.redirect('/');
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

router.get('/home', function(req, res, next) {
  res.redirect('/');
});

router.post('/updateuserprofie', function(req, res, next) {
  console.log(req.body.artist_category);
  console.log('enter in update user');
  User.findById(req.session.passport.user, function (err, user) {
    console.log(req.session.passport.user);
  if (err) throw err;
    console.log('set');
    user.phone = req.body.phone;
    user.gender = req.body.gender;
    user.age = req.body.age;
    user.address = req.body.address;
    user.city = req.body.city;
    user.state = req.body.city;
    user.pin = req.body.pin;
    User.updateUser(user,function (err, updatedUser) {
    if (err) return handleError(err);
    console.log('update');
    res.redirect('userprofile');
    });
  });
});

router.post('/updateuser', function(req, res, next) {
  console.log(req.body.artist_category);
  console.log('enter in update user');
  User.findById(req.session.passport.user, function (err, user) {
    console.log(req.session.passport.user);
  if (err) throw err;
    console.log('set');
    user.phone = req.body.phone;
    user.gender = req.body.gender;
    user.age = req.body.age;
    user.address = req.body.address;
    user.city = req.body.city;
    user.state = req.body.city;
    user.pin = req.body.pin;
    User.updateUser(user,function (err, updatedUser) {
    if (err) return handleError(err);
    console.log('update');
    
    });

      console.log(req.session);
        if(req.body.artist_category!="event"){
          Event.checkDate(req.body.start_date,req.body.end_date,req.body.artist_id,function(err,result){
          if(err) throw err;
          if(result.length!=0){
            console.log("sorry dates are already picked");
            console.log(result);
            res.redirect('/artists/'+req.body.artist_id);
          }
          else{
         Artist.getArtistById(req.body.artist_id,function(err,artist)
         {
           if(err) throw err;
           console.log(req.body.artist_category);
           console.log(req.body.artist_id);
           var newEvent=new Event({
             user_id:req.session.passport.user,
             artist_id:req.body.artist_id,
             start_date:req.body.start_date,
             end_date:req.body.end_date,
             address:undefined,
             status:"request",
             active:true,
             timestamp:new Date(),
             details:req.body.details,
             user_name:user.name,
             user_phone:user.phone,
             user_email:user.email,
             user_type:"simple",
             user_address:user.address,
             user_city:user.city,
             user_state:user.state,
             user_pin:user.pin,
             artist_name:artist.name,
             artist_phone:artist.phone,
             artist_email:artist.email,
             artist_gender:artist.gender,
             artist_category:artist.sub_category,
             user_gender:user.gender

           });
           Event.createEvent(newEvent,function(err,result){
            if(err) {throw err};
         console.log("event successfully added");
           res.redirect('/artists/'+req.body.artist_id);
          var newNotification=new Notfication({
            artist_id:req.body.artist_id,
            user_actid:user._id,
            message:"you have one event requested",
            href:"/artists/dashboard",
            isread:false,
          });
          Notfication.addNewNotification(newNotification,function(err,notification){if(err) throw err;});
           
         }); 
        
      });
    }
  });
  }

         else{
          Event.checkDateEmanager(req.body.start_date,req.body.end_date,req.body.artist_id,function(err,result){
          if(err) throw err;
          if(result.length!=0){
            console.log("sorry dates are already picked");
            console.log(result);
            res.redirect('/emanagers/'+req.body.artist_id);
          }
          else{
             Emanager.getEmanagerById(req.body.artist_id,function(err,emanager)
             {
               if(err) throw err;
               console.log(req.body.artist_id);
               var newEvent=new Event({
                 user_id:req.session.passport.user,
                 emanager_id:req.body.artist_id,
                 start_date:req.body.start_date,
                 end_date:req.body.end_date,
                 address:undefined,
                 status:"request",
                 active:true,
                 timestamp:new Date(),
                 details:req.body.details,
                 user_name:user.name,
                 user_phone:user.phone,
                 user_email:user.email,
                 user_address:user.address,
                 user_city:user.city,
                 user_state:user.state,
                 user_pin:user.pin,
                 user_type:"simple",
                 emanager_name:emanager.name,
                 emanager_phone:emanager.phone,
                 emanager_email:emanager.email,
                 emanager_gender:emanager.gender,
                 artist_category:"event manager",
                 user_gender:user.gender

               });
               Event.createEvent(newEvent,function(err,result){
                if(err) {throw err};
             console.log("event successfully added");
               res.redirect('/emanagers/'+req.body.artist_id);
              var newNotification=new Notfication({
                emanager_id:req.body.artist_id,
                user_actid:user._id,
                message:"you have one event requested",
                href:"/emanagers/dashboard",
                isread:false,
              });
              Notfication.addNewNotification(newNotification,function(err,notification){if(err) throw err;});
             
               
             }); 
          });
        }
      });

  }




 });
});

router.post('/forgotpassword', function(req, res, next) {
  var email = req.body.email;
  var rand = Math.floor((Math.random() * 100) + 54)

  User.getUserByEmail(email, function(err,user){
            if(err)
                throw err;
            if(user)
                {
                    if(user.active){
                    //res.send("email already exist : Login");
                    user.rand = rand;
                    User.updateUser(user,function (err, updatedUser) {
                    if (err) return handleError(err);
                    console.log('update');
                    
                    });
                    host=req.get('host');
                                var encodedMail = new Buffer(email).toString('base64');
                                link="http://"+req.get('host')+"/users/verifypass?mail="+encodedMail+"&id="+rand;
                             var   mailOptions={
                                    to : email,
                                    subject : "Reset Password",
                                    html : "Hello,<br> Please Click on the link to reset password.<br><a href="+link+">Click here to verify</a>" 
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

                    }
                    else{
                        res.send("Email verification is pending");
                        //res.location('/');
                          //        res.redirect('/');
                      }
                      return;
                } 
                else
                {
                    console.log("Sign Up First");

                }
               
          });

});

router.post('/register', multer(multerConfig).single('profileimage'), function(req, res, next) {
  //console.log("FL :-> "+req.file);
  console.log("NM :-> "+req.body.name);
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var phone = undefined;
  var gender= undefined;
  var age= undefined;
  var address= undefined;
  var city= undefined;
  var state= undefined;
  var pin= undefined;

  // Form Validation
  //req.checkBody('name', 'Name field is required').notEmpty();
  //req.checkBody('email', 'Email field is required').notEmpty();
  //req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password field is required').notEmpty();

  // Check Errors
  var errors = req.validationErrors();

  if(errors){
    console.log(errors);
    res.render('/', {
      errors: errors
    });
  }else{
    var newUser = new User({
      name: name,
      email: email,
      password: password,
      phone: phone,
      gender: gender,
      age: age,
      address: address,
      city: city,
      state: state,
      pin: pin,
      active: false,
      rand: Math.floor((Math.random() * 100) + 54)
    });

          User.getUserByEmail(newUser.email, function(err,user){
            if(err)
                throw err;
            if(user)
                {
                    if(user.active){
                    res.send("email already exist : Login");
                    //req.flash('success', 'Email already exist : Login');
                    //res.location('/');
                    //res.redirect('/login');

                    }
                    else{
                        res.send("verification is pending");
                        //res.location('/');
                          //        res.redirect('/');
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


router.get('/login', function(req, res, next) {
  res.render('login', {title: 'Login'});
});

router.post('/login',
  passport.authenticate('local', {failureRedirect:'/', failureFlash: 'Invalid Email or password'}),
  function(req, res) {
    if(!req.session.actem && !req.session.actart)
    {
      req.flash('success', 'Login Successful');
      req.session.active = true;
      req.session.userid = req.session.passport.user;
      console.log("CUSTOM");
      console.log(req.session);
      req.flash('successMessage', 'You are successfully loggedin');
      res.redirect('/');
    }
    else{
      console.log('Already logged in as another user');
      req.logout();
      res.redirect('/');
    }
});

passport.serializeUser(function(user, done) {
  
      done(null, user.id);
    
});

passport.deserializeUser(function(id, done) {

      User.getUserById(id, function(err, user) {
        done(err, user);
      });
    
});

passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, function(email, password, done){
      
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
            //console.log(user._id);
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
                console.log('Verifying');
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


router.get('/verifypass',function(req,res){
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
    res.send("corrupted link try to reset again");
    return;
  }
  else{
    if(user.active){
        rand=user.rand;
            if(req.query.id==rand)
            {
                var query = { 'email': decodedMail };
                user.active=true;
                user.rand=undefined;
                console.log('Verifying');
                user.save(function(err){
                    if(err)
                        res.end("some error occured try after some time");
                    else
                    {
                        console.log("email is verified");
                        //res.send("<h1>Email "+decodedMail+" is been Successfully verified");
                        req.flash('success', 'Email has been Successfully Verified');
                        res.render('resetpass',{user:'user', id: user._id});
                    }

                });

            }
            else
            {
                console.log("email is not verified");
                res.end("<h1>Bad Request</h1>");
            }
      }
    else
       { 
          console.log("Not Active");
       }
    }
  });
});


router.post('/finishReview',function(req,res){
  Event.getEventById(req.body.id,function(err,event){
    if(err) throw err;

      event.status="review";
      Event.updateEvent(event,function(err,event){
        if(err) throw err;
        console.log(event);
      Event.getEventByUserId(req.session.passport.user,function(err,events){
        if(err) throw err;
        User.getUserById(req.session.passport.user,function(err,user){
          if(err) throw err;
          res.redirect('userprofile');
          var newNotification=new Notfication({
            artist_id:event.artist_id,
            user_actid:user._id,
            message:"your one event got ended",
            href:"/artists/dashboard",          
            isread:false,
          });
          Notfication.addNewNotification(newNotification,function(err,notification){if(err) throw err;});
        });
      });
    });
  });
});
router.post('/finishEvent',function(req,res){
  Event.getEventById(req.body.id,function(err,event){
    if(err) throw err;
      event.active=false;
      event.status="finish";
      Event.updateEvent(event,function(err,event){
        if(err) throw err;    
     Event.getEventByUserId(req.session.passport.user,function(err,events){
        if(err) throw err;
        User.getUserById(req.session.passport.user,function(err,user){
          if(err) throw err;
          //res.render('userprofile',{user:user,event:events});
          res.redirect('userprofile');
        });
      });
   });
  });
});
router.post('/review',function(req,res)
  {
    Event.getEventById(req.body.id,function(err,event){
      if(err) throw err;
        event.active=false;
        event.status="reviewed";
        event.review=req.body.review;
        event.rating=req.body.rating;
        Event.updateEvent(event,function(err,event){
          if(err) throw err;

      Artist.findById(event.artist_id, function (err, artist) {
        if (err) throw err;
        artist.count=artist.count+1;
        artist.rating=(artist.rating+Number(req.body.rating))/artist.count;
      Artist.updateArtist(artist,function (err, updatedArtist) {
        if (err) throw err;
       
      });
    });
       Event.getEventByUserId(req.session.passport.user,function(err,events){
          if(err) throw err;
          User.getUserById(req.session.passport.user,function(err,user){
            if(err) throw err;
            res.redirect('userprofile');
            var newNotification=new Notfication({
              artist_id:event.artist_id,
              user_actid:user._id,
              message:"you got one review as "+req.body.review+" with rating"+req.body.rating,
              href:"/artists/dashboard",            
              isread:false,
            });
            Notfication.addNewNotification(newNotification,function(err,notification){if(err) throw err;});

          });
        });
     });
    });

});

router.get('/userprofile',function(req,res){
  Event.getEventByUserId(req.session.passport.user,function(err,events){
    if(err) throw err;
    User.getUserById(req.session.passport.user,function(err,user){
      if(err) throw err;
      Notfication.getNotificationByUserId(req.session.passport.user,function(err,notifications){
        if(err) throw err;
        res.render('userprofile',{user:user,event:events,notification:notifications});
        Notfication.readNotificationByUserId(req.session.passport.user,function(err,notifications){if(err) throw err;});
      });
   });
  });
});
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'Logout Successful');
  req.session.active = false;
  req.session.userid = undefined;
  res.redirect('/');
});
module.exports = router;
