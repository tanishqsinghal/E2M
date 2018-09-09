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
var Notfication=require('../models/notification');
var Institute = require('../models/institute');

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

router.get('/logout', function(req, res){
  console.log("Entered in logout");
  req.logout();
  req.flash('success', 'Logout Successful');
  req.session.actart = false;
  res.redirect('/');
});

router.get('/dashboard',function(req,res){
  if(req.session.actart==false)
  {
    res.redirect('/');
  }
  else
  {
    Artist.getArtistById(req.session.arid,function(err,artist){
      if(err){ 
        throw err}
      else
      {
        Event.getEventByArtistId(req.session.arid,function(err,events){

          if(err) throw err;
          Event.getPastEventByArtistId(req.session.arid,function(err,pastevents){

              res.render('artdash',{artist:artist,event:events,pastevent:pastevents});  
          });
          
        });
        
      }
    });
  }
});
router.get('/notifications',function(req,res){
  Notfication.getNotificationByArtistId(req.session.arid,function(err,notifications){
    if(err) throw err;
    Notfication.getReadNotificationByArtistId(req.session.arid,function(err,readnotification){
      if(err) throw err;
      res.json({notification:notifications,readnotification:readnotification});  
    });
    
    Notfication.readNotificationByArtistId(req.session.arid,function(err,notifications){if(err) throw err;});
  });
});

router.post('/forgotpassword', function(req, res, next) {
  var email = req.body.email;
  var rand = Math.floor((Math.random() * 100) + 54)

  Artist.getArtistByEmail(email, function(err,artist){
            if(err)
                throw err;
            if(artist)
                {
                    if(artist.active){
                    //res.send("email already exist : Login");
                    artist.rand = rand;
                    Artist.updateArtist(artist,function (err, updatedArtist) {
                    if (err) return handleError(err);
                    console.log('update');
                    
                    });
                    host=req.get('host');
                                var encodedMail = new Buffer(email).toString('base64');
                                link="http://"+req.get('host')+"/artists/verifypass?mail="+encodedMail+"&id="+rand;
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
                      console.log(artist);

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

router.post('/resetpass', function(req, res, next) {
  Artist.findById(req.body.id, function (err, artist) {
    
  if (err) throw err;
    console.log('set');
    artist.password = req.body.password;
    Artist.resetPass(artist,function (err, updatedArtist) {
    if (err) return handleError(err);
    console.log('update');
    
    });
  });
  res.redirect('/');
});


router.get('/verify',function(req,res){
         let decodedMail = new Buffer(req.query.mail, 'base64').toString('ascii');
       var query = Artist.findOne({ 'email': decodedMail});

    // selecting the   `active` and `rand` fields
      query.select('active rand');

    // execute the query at a later time
      var rand;
      query.exec(function (err, artist) {
    if (err) return handleError(err);
    if(!artist)
    {
      res.send("corrupted link try to register again");
      return;
    }
    else{
      if(artist.active){
          //res.send("email is already verified");
          req.flash('success', 'Email is Already Verified');
          res.location('/');
          res.redirect('/');
        }
      else
         { rand=artist.rand;
              if(req.query.id==rand)
              {
                  var query = { 'email': decodedMail };
                  artist.active=true;
                  artist.rand=undefined;
                  console.log('Verifying');
                  artist.save(function(err){
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
     var query = Artist.findOne({ 'email': decodedMail});

    // selecting the   `active` and `rand` fields
    query.select('active rand');

    // execute the query at a later time
    var rand;
    query.exec(function (err, artist) {
  if (err) return handleError(err);
  if(!artist)
  {
    res.send("corrupted link try to reset again");
    return;
  }
  else{
    if(artist.active){
        rand=artist.rand;
            if(req.query.id==rand)
            {
                var query = { 'email': decodedMail };
                artist.active=true;
                artist.rand=undefined;
                console.log('Verifying');
                artist.save(function(err){
                    if(err)
                        res.end("some error occured try after some time");
                    else
                    {
                        console.log("email is verified");
                        //res.send("<h1>Email "+decodedMail+" is been Successfully verified");
                        req.flash('success', 'Email has been Successfully Verified');
                        res.render('resetpass',{user:'artist', id: artist._id});
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

router.get('/:id',function (req,res){

  Artist.getArtistById(req.params.id,function(err,artist){
    if(err){ 
      console.log('JGFGHVGH');
      throw err}
    else
    {
      User.findById(req.session.userid, function (err, user) {

        console.log(req.session.active);
        var act=false;
        if(req.session.active || req.session.actem)
          act=true;
        res.render('artist',{artist:artist, chk: act, user: user, artact: req.session.actart, useract: req.session.active, emact: req.session.actem});

      });
      //console.log(req.session.active);
      //res.render('artist',{artist:artist, chk: req.session.active});
    }
  });
});



router.post('/updateartist', function(req, res, next) {
  Artist.findById(req.session.arid, function (err, artist) {
    console.log(req.session.arid);
    if (err) throw err;
    console.log('set');
    artist.name = req.body.name;
    artist.gender = req.body.gender;
    artist.age = req.body.age;
    artist.address = req.body.address;
    artist.city = req.body.city;
    artist.state = req.body.city;
    artist.pin = req.body.pin;
    artist.qualification = req.body.qualification;
    artist.specialization = req.body.specialization;
    artist.small_description = req.body.bio;
    artist.website_link = req.body.link;
    console.log(artist);
    Artist.updateArtist(artist,function (err, updatedArtist) {
    if (err) return handleError(err);
    console.log('update');
    console.log(artist);
    res.redirect('/artists/dashboard');    
  });
  });
});


router.post('/loginart',
  function(req, res) {
    if(!req.session.active && !req.session.actem)
    {
      Artist.getArtistByEmail(req.body.email, function(err, artist){
        if(err){ 
          req.flash('successMessage', 'Not loggedin');
          throw err;

        }
        if(!artist){
          console.log("Sign Up first");
        }
        else{
          if(artist.active){
            Artist.comparePassword(req.body.password, artist.password, function(err, isMatch){
            if(err) throw err;
            if(isMatch){
              console.log('SET');
              req.session.actart = true;
              req.session.arid = artist._id;
              console.log(req.session.arid);
              //res.render('artdash', {artist: artist});

              res.redirect('/artists/dashboard');
            }else{
              console.log('Invalid Password');
            }
          });
          }else{
            console.log("Verify your email");
          }
        }
      });
    }
    else{
      console.log('Already logged in as another user');
      res.redirect('/');
    }
});


router.post('/portfolio', 
  multer({
    
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
  }).any(),
  function(req, res, next) {
    console.log(req.files);
    
    Artist.findById(req.session.arid, function (err, artist) {
      //artist.photos = array;
      req.files.forEach(function(item) {
        artist.photos.push(item.filename);
      });
      console.log(artist);
      Artist.updateArtist(artist,function (err, updatedArtist) {
      if (err) return handleError(err);
      console.log('Portfolio Added');
      console.log(artist);
      res.redirect('/artists/dashboard');    
    });
  });
});

router.post('/updateProfilePicture', 
  multer({
    
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
  }).single('aimage'),
  function(req, res, next) {
    console.log(req.file);
    
    Artist.findById(req.session.arid, function (err, artist) {
      artist.photo = req.file.filename;
      console.log(artist);
      Artist.updateArtist(artist,function (err, updatedArtist) {
      if (err) return handleError(err);
      console.log('Profile Picture Updated');
      console.log(artist);
      res.redirect('/artists/dashboard');    
    });
  });
});




router.post('/registerartist', 
  multer({
    
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
  }).single('aimage'),
  function(req, res, next) {
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
  var photo = req.file.filename;
  var instname = req.body.instname;
  var instid = undefined;
  Institute.getInstituteByName(instname, function(err, institute)
      {     
        if(err)
          throw err;
        else
          {
            console.log('INSTITUTE FOUND :-> ' + institute);
            instid = institute._id;
            console.log(instid);


            console.log('FILE :-> '+req.file.filename);
  console.log('NAME :-> '+ name);


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
    console.log(errors);
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
    qualification: qualification,
    specialization: specialization,
    sub_category: catagory,
    small_description: bio,
    pin: pin,
    photo: photo,
    website_link: link,
    instid: instid,
    instname: instname,
      active: false,
      count:0,
      rand: Math.floor((Math.random() * 100) + 54)
    });

            
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
          }
    });
  
});




router.post('/add_event',function(req,res){
  console.log("1");
  var newEvent=new Event({
    artist_id:req.body.artist_id,
    start_date:req.body.start_date,
    end_date:req.body.end_date,
    address:req.body.address,
    status:"active",
    active:true,
    timestamp:new Date(),
    details:req.body.details});
  Event.createEvent(newEvent,function(err,result){
    
    
    if(err) {console.log("i'm here");throw err};
     

        console.log("event successfully added");
 
        res.redirect('/artists/dashboard');
        
    
    
  });
});

router.post('/acceptRequest',function(req,res){
  console.log("right function");
   Event.getEventById(req.body.id,function(err,event){
  if(req.body.accept=="accept"){
      console.log("accepting");
      event.status="active";
      Event.updateEvent(event,function(err,event){
        if(err) throw err;
        var us=undefined;
        var eman=undefined;
        var hre=undefined;
        if(event.user_type=="simple")
        {
          us=event.user_id;
          hre="/users/userprofile";
        }
        else
        {
          eman=event.user_id;
          hre="emanagers/dashboard";
        }
        var newNotification=new Notfication({
          emanager_id:eman,
          user_id:us,
          artist_actid:req.session.arid,
          message:"your request is accepted",
          href:hre,
          isread:false,
        });
        Notfication.addNewNotification(newNotification,function(err,notification){if(err) throw err;});
      });
    }  
    else{
      event.active=false; 
      event.status="reject";
      Event.updateEvent(event,function(err,event){
        if(err) throw err;
        var us=undefined;
        var eman=undefined;
        var hre=undefined;
        if(event.user_type=="simple")
        {
          us=event.user_id;
          hre="/users/userprofile";
        }
        else
        {
          eman=event.user_id;
          hre="emanagers/dashboard";
        }
        var newNotification=new Notfication({
          emanager_id:eman,
          user_id:us,
          artist_actid:req.session.arid,
          message:"your request is accepted",
          href:hre,
          isread:false,
        });
        Notfication.addNewNotification(newNotification,function(err,notification){if(err) throw err;});
      });
   
    }
     
       res.redirect('/artists/dashboard');
        
      });

});
router.post('/finishEvent',function(req,res){
  Event.getEventById(req.body.id,function(err,event){
    if(err) throw err;
    if(event.user_id)
    {
      event.status="review";
      Event.updateEvent(event,function(err,event){
        if(err) throw err;
        var us=undefined;
        var eman=undefined;
        var hre=undefined;
        if(event.user_type=="simple")
        {
          us=event.user_id;
          hre="/users/userprofile";
        }
        else
        {
          eman=event.user_id;
          hre="emanagers/dashboard";
        }

        var newNotification=new Notfication({
          emanager_id:eman,
          user_id:us,
          artist_actid:req.session.arid,
          message:"your one event is ended",
          href:hre,
          isread:false,
        });
        Notfication.addNewNotification(newNotification,function(err,notification){if(err) throw err;});
      });

    }
    else
    {
      event.active=false;
      event.status="finish";
      Event.updateEvent(event,function(err,event){
        if(err) throw err;
      });

    }
    res.redirect('/artists/dashboard');
  });
});







module.exports = router;