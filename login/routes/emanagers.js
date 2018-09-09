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
var Task=require('../models/task');
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
  req.session.actem = false;
  res.redirect('/');
});
router.get('/dashboard',function(req,res){
  if(req.session.actem==false)
  {
    res.redirect('/');
  }
  else
  {
    Emanager.getEmanagerById(req.session.emid,function(err,emanager){
      if(err){ 
        throw err}
      else
      {
        Event.getEventByEmanagerId(req.session.emid,function(err,events){
            if(err) throw err;
            Category.getCategory(function(err,categories)
            {
              if(err) throw err;
              Event.getPastEventByEmanagerId(req.session.emid,function(err,pastevents){
                if(err) throw err;
                Notification.getNotificationByEmanagerId(req.session.emid,function(err,notifications){
                  if(err) throw err;
                  res.render('emdash',{emanager:emanager,event:events,category:categories,pastevent:pastevents,notification:notifications});                

                Notification.readNotificationByEmanagerId(req.session.emid,function(err,notifications){if(err) throw err;});
                });
              });

          });
        });
      }
    });
  }
});


router.post('/forgotpassword', function(req, res, next) {
  var email = req.body.email;
  var rand = Math.floor((Math.random() * 100) + 54)

  Emanager.getEmanagerByEmail(email, function(err,emanager){
            if(err)
                throw err;
            if(emanager)
                {
                    if(emanager.active){
                    //res.send("email already exist : Login");
                    emanager.rand = rand;
                    Emanager.updateEmanager(emanager,function (err, updatedEmanager) {
                    if (err) return handleError(err);
                    console.log('update');
                    
                    });
                    host=req.get('host');
                                var encodedMail = new Buffer(email).toString('base64');
                                link="http://"+req.get('host')+"/emanagers/verifypass?mail="+encodedMail+"&id="+rand;
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
                      console.log(emanager);

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
  Emanager.findById(req.body.id, function (err, emanager) {
    
  if (err) throw err;
    console.log('set');
    emanager.password = req.body.password;
    Emanager.resetPass(emanager,function (err, updatedEmanager) {
    if (err) return handleError(err);
    console.log('update');
    
    });
  });
  res.redirect('/');
});


router.post('/event/finishReview',function(req,res){
  Event.getEventById(req.body.id,function(err,event){
    if(err) throw err;

      event.status="review";
      Event.updateEvent(event,function(err,event){
        if(err) throw err;
        console.log(event);

          res.redirect('/emanagers/event/'+req.body.event_id);
          var newNotification=new Notification({
            artist_id:event.artist_id,
            emanager_actid:req.session.emid,
            message:"your one event got ended",
            href:"/artists/dashboard",
            isread:false,
          });
          Notification.addNewNotification(newNotification,function(err,notification){if(err) throw err;});

        });

  });
});
router.post('/event/finishEvent',function(req,res){
  Event.getEventById(req.body.id,function(err,event){
    if(err) throw err;
      event.active=false;
      event.status="finish";
      Event.updateEvent(event,function(err,event){
        if(err) throw err;    
        res.redirect('/emanagers/event/'+req.body.event_id);
   });
  });
});
router.post('/event/review',function(req,res)
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
      res.redirect('/emanagers/event/'+req.body.event_id);
      var newNotification=new Notification({
        artist_id:event.artist_id,
        emanager_actid:req.session.emid,
        message:"you have one review"+req.body.review+"with rating"+req.body.rating,
        href:"/artists/dashboard",
        isread:false,
      });
      Notification.addNewNotification(newNotification,function(err,notification){if(err) throw err;});
     });
    });

});
router.get('/event/tasks',function(req,res){
  var artistdetails=[];
  var obj;
  Event.getEventByEventId(req.query.event_id,function(err,events){
    if(err) throw err;
    Task.getTaskById(req.query.task_id,function(err,task){
      if(err) throw err;
      for(var i=0; i < events.length; i++) {
        if(events[i].status=="active"){
          var setdetail=false;
          for(var j=0;j<task.artists.length;j++){
            if(task.artists[j].id==events[i].artist_id){
              artistdetails.push({id:events[i].artist_id,name:events[i].artist_name,category:events[i].artist_category,check:true});
              setdetail=true;
              break;
            }
          }
          if(!setdetail)
          artistdetails.push({id:events[i].artist_id,name:events[i].artist_name,category:events[i].artist_category,check:false});
        } 
      }

      res.json({artistdetails:artistdetails});
    });
  });
});
router.post('/event/addtask',function(req,res){
  
  var artistdetails=[];
  console.log(req.body.artistname);
  if(req.body.artistname)
  if(req.body.artistname.constructor===Array){
  for(var i=0;i<req.body.artistname.length;i++)
  {
    var detail=req.body.artistname[i];
    var obj={id:detail.substr(0,24),name:detail.slice(25,detail.indexOf('&')),category:detail.substr(detail.indexOf('&')+1)};
    artistdetails.push(obj);
  }
 }
 else
 {
  var detail=req.body.artistname;
  var obj={id:detail.substr(0,24),name:detail.slice(25,detail.indexOf('&')),category:detail.substr(detail.indexOf('&')+1)};
  artistdetails.push(obj);

 }
  console.log(artistdetails);
  
  var newTask=new Task({
    name:req.body.name,
    description:req.body.description,
    event_id:req.body.event_id,
    artists:artistdetails,
    complete:false
  });
  Task.addNewTask(newTask,function(err,task){
    if(err) throw err;
    res.redirect('/emanagers/event/'+req.body.event_id);
  });
  
});
router.post('/event/updatetask',function(req,res){
  
  var artistdetails=[];
  console.log(req.body.artistname);
  if(req.body.artistname)
  if(req.body.artistname.constructor===Array){
  for(var i=0;i<req.body.artistname.length;i++)
  {
    var detail=req.body.artistname[i];
    var obj={id:detail.substr(0,24),name:detail.slice(25,detail.indexOf('&')),category:detail.substr(detail.indexOf('&')+1)};
    artistdetails.push(obj);
  }
 }
 else
 {
  var detail=req.body.artistname;
  var obj={id:detail.substr(0,24),name:detail.slice(25,detail.indexOf('&')),category:detail.substr(detail.indexOf('&')+1)};
    artistdetails.push(obj);

 }
  console.log(artistdetails);
  
  Task.findById(req.body.task_id,function(err,task){
    if(err) throw err;
    task.name=req.body.name;
    task.artists=artistdetails;
    task.description=req.body.description;
    task.save(function(err,updatedtask){
      if(err) throw err;
      res.redirect('/emanagers/event/'+req.body.event_id);
    });  
  });
  
});
router.post('/event/finishTask',function(req,res){
  Task.finishTask(req.body.task_id,function(err,result){
    if(err) throw err;
        res.redirect('/emanagers/event/'+req.body.event_id);
  });
});

router.get('/event/:id',function(req,res){
  console.log(req.session);
  if(req.session.actem==false || !req.session.actem)
  {
    res.redirect('/');
  }
  else{
    Event.getEventByEventId(req.params.id,function(err,events){
      if(err) throw err;
      Event.getEventById(req.params.id,function(err,currentevent){
        Task.getTaskByEventId(req.params.id,function(err,tasks){
          if(err) throw err;
          res.render('event',{event:events,currentevent:currentevent,task:tasks});  
        });
          
      });
      
    });
  }

});

router.get('/verify',function(req,res){
         let decodedMail = new Buffer(req.query.mail, 'base64').toString('ascii');
       var query = Emanager.findOne({ 'email': decodedMail});

    // selecting the   `active` and `rand` fields
      query.select('active rand');

    // execute the query at a later time
      var rand;
      query.exec(function (err, emanager) {
    if (err) return handleError(err);
    if(!emanager)
    {
      res.send("corrupted link try to register again");
      return;
    }
    else{
      if(emanager.active){
          //res.send("email is already verified");
          req.flash('success', 'Email is Already Verified');
          res.location('/');
          res.redirect('/');
        }
      else
         { rand=emanager.rand;
              if(req.query.id==rand)
              {
                  var query = { 'email': decodedMail };
                  emanager.active=true;
                  emanager.rand=undefined;
                  console.log('Verifying');
                  emanager.save(function(err){
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
     var query = Emanager.findOne({ 'email': decodedMail});

    // selecting the   `active` and `rand` fields
    query.select('active rand');

    // execute the query at a later time
    var rand;
    query.exec(function (err, emanager) {
  if (err) return handleError(err);
  if(!emanager)
  {
    res.send("corrupted link try to reset again");
    return;
  }
  else{
    if(emanager.active){
        rand=emanager.rand;
            if(req.query.id==rand)
            {
                var query = { 'email': decodedMail };
                emanager.active=true;
                emanager.rand=undefined;
                console.log('Verifying');
                emanager.save(function(err){
                    if(err)
                        res.end("some error occured try after some time");
                    else
                    {
                        console.log("email is verified");
                        //res.send("<h1>Email "+decodedMail+" is been Successfully verified");
                        req.flash('success', 'Email has been Successfully Verified');
                        res.render('resetpass',{user:'emanager', id: emanager._id});
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



router.post('/addartist',function(req,res){
  console.log("you are here");
  console.log(req.session.event_id);
  Event.findById(req.session.event_id,function(err,event){
    if(err) throw err;
    var add;
    if(event.user_id==undefined)
      add=event.address;
    else
    {
      add=event.user_address+","+event.user_city+","+event.user_state+","+event.user_pin;
    }
   Emanager.findById(req.session.emid, function (err,emanager) {
    if (err) throw err;
       console.log(req.session);
         if(req.body.artist_category!="event"){
           Event.checkDate(req.body.start_date,req.body.end_date,req.body.artist_id,function(err,result){
           if(err) throw err;
           if(result.length!=0){
             console.log("sorry dates are already picked");
             console.log(result);
             res.redirect('/emanagers/event/'+req.session.event_id);
           }
           else{

          Artist.getArtistById(req.body.artist_id,function(err,artist)
          {
            if(err) throw err;
            console.log(req.body.artist_category);
            console.log(req.body.artist_id);
            var newEvent=new Event({
              user_id:req.session.emid,
              artist_id:req.body.artist_id,
              start_date:req.body.start_date,
              end_date:req.body.end_date,
              address:add,
              status:"request",
              active:true,
              timestamp:new Date(),
              details:req.body.details,
              user_name:emanager.name,
              user_phone:emanager.phone,
              user_email:emanager.email,
              user_type:"event manager",
              artist_name:artist.name,
              artist_phone:artist.phone,
              artist_email:artist.email,
              artist_gender:artist.gender,
              artist_category:artist.sub_category,
              user_gender:emanager.gender,
              event_id:req.session.event_id

            });
            Event.createEvent(newEvent,function(err,result){
             if(err) {throw err};
             console.log(add);
          console.log("event successfully added");
          res.redirect('/emanagers/event/'+req.session.event_id);
            var newNotification=new Notification({
              artist_id:req.body.artist_id,
              emanager_actid:emanager._id,
              message:"you have one event request",
              href:"/artists/dashboard",
              isread:false,
            });
            Notification.addNewNotification(newNotification,function(err,notification){if(err) throw err;});
          
            
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
             res.redirect('/emanagers/event/'+req.session.event_id);
           }
           else{
              Emanager.getEmanagerById(req.body.artist_id,function(err,em)
              {
                if(err) throw err;
                console.log(req.body.artist_id);
                var newEvent=new Event({
                  user_id:req.session.emid,
                  emanager_id:req.body.artist_id,
                  start_date:req.body.start_date,
                  end_date:req.body.end_date,
                  address:add,
                  status:"request",
                  active:true,
                  timestamp:new Date(),
                  details:req.body.details,
                  user_name:emanager.name,
                  user_phone:emanager.phone,
                  user_email:emanager.email,
                  user_type:"event manager",
                  emanager_name:em.name,
                  emanager_phone:em.phone,
                  emanager_email:em.email,
                  emanager_gender:em.gender,
                  artist_category:"event manager",
                  user_gender:emanager.gender,
                  event_id:req.session.event_id

                });
                Event.createEvent(newEvent,function(err,result){
                 if(err) {throw err};
              console.log("event successfully added");
              res.redirect('/emanagers/event/'+req.session.event_id);
                var newNotification=new Notification({
                  emanager_id:em._id,
                  emanager_actid:emanager._id,
                  message:"you have one event requested",
                  href:"/emanagers/dashboard",
                  isread:false,
                });
                Notification.addNewNotification(newNotification,function(err,notification){if(err) throw err;});
              
                
              }); 
           });
         }
       });

   }




  });
 });
});

router.get('/:id',function (req,res){
  Emanager.getEmanagerById(req.params.id,function(err,artist){
    if(err){ 
      console.log('JGFGHVGH');
        throw err;}
    else
    {
      User.findById(req.session.userid, function (err, user) {
        var act=false;
        if(req.session.active || req.session.actem)
          act=true;
        console.log(req.session.active);
        res.render('artist',{artist:artist, chk:act, user: user, artact: req.session.actart, useract: req.session.active, emact: req.session.actem});

      });

    }
  });
});


router.post('/loginemanager',
  function(req, res) {
    if(!req.session.active && !req.session.actart)
    {
      Emanager.getEmanagerByEmail(req.body.email, function(err, emanager){
        if(err) throw err;
        if(!emanager){
          console.log("Sign Up first");
        }
        else{
          if(emanager.active){
            Emanager.comparePassword(req.body.password, emanager.password, function(err, isMatch){
            if(err) throw err;
            if(isMatch){
              console.log('SET');
              req.session.actem = true;
              req.session.emid = emanager._id;
              console.log(req.session.emid);
              res.redirect('/emanagers/dashboard');
              /*Event.getEventByEmanagerId(req.session.emid,function(err,events){
                console.log(events);
                if(err) throw err;
                res.render('emdash',{emanager:emanager,event:events});
              });*/
              //res.redirect('/');
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
    
    Emanager.findById(req.session.emid, function (err, emanager) {
      emanager.photo = req.file.filename;
      console.log(emanager);
      Emanager.updateEmanager(emanager,function (err, updatedEmanager) {
      if (err) return handleError(err);
      console.log('Profile Picture Updated');
      console.log(emanager);
      res.redirect('/emanagers/dashboard');    
    });
  });
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
    
    Emanager.findById(req.session.emid, function (err, emanager) {
      //artist.photos = array;
      req.files.forEach(function(item) {
        emanager.photos.push(item.filename);
      });
      console.log(emanager);
      Emanager.updateEmanager(emanager,function (err, updatedEmanager) {
      if (err) return handleError(err);
      console.log('Portfolio Added');
      console.log(emanager);
      res.redirect('/emanagers/dashboard');    
    });
  });
});


router.post('/registeremanager', 
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
    var newEmanager = new Emanager({
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
    small_description: bio,
    pin: pin,
    photo: photo,
    website_link: link,
    instid: instid,
    instname: instname,
    sub_category:"event manager",
      active: false,
      count:0,
      rand: Math.floor((Math.random() * 100) + 54)
    });

  
          Emanager.getEmanagerByEmail(newEmanager.email, function(err, emanager){
            if(err){
                throw err;
            }
            if(emanager)
                {
                  console.log(newEmanager.email);
                  console.log(emanager);
                    if(emanager.active)
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
                    Emanager.createEmanager(newEmanager, function(err, emanager){
                      console.log("before");
                      if(err) throw err;
                      console.log("after");
                                      host=req.get('host');
                                var encodedMail = new Buffer(newEmanager.email).toString('base64');
                                link="http://"+req.get('host')+"/emanagers/verify?mail="+encodedMail+"&id="+newEmanager.rand;
                             var   mailOptions={
                                    to : newEmanager.email,
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
                      console.log(emanager);
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
    emanager_id:req.body.emanager_id,
    start_date:req.body.start_date,
    end_date:req.body.end_date,
    address:req.body.address,
    status:"active",
    active:true,
    timestamp:new Date(),
    details:req.body.details});
  Event.createEvent(newEvent,function(err,result){
    if(err) {console.log("i'm here");throw err};
    res.redirect('/emanagers/dashboard');  
    
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

        var newNotification=new Notification({
          emanager_id:eman,
          user_id:us,
          emanager_actid:req.session.emid,
          message:"your request is accepted",
          href:hre,
          isread:false,
        });
        Notification.addNewNotification(newNotification,function(err,notification){if(err) throw err;});
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

        var newNotification=new Notification({
          emanager_id:eman,
          user_id:us,
          emanager_actid:req.session.emid,
          message:"your request is rejected",
          href:hre,
          isread:false,
        });
        Notification.addNewNotification(newNotification,function(err,notification){if(err) throw err;});
      });
   
    }
     
    res.redirect('/emanagers/dashboard');
        
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

        var newNotification=new Notification({
          emanager_id:eman,
          user_id:us,
          emanager_actid:req.session.emid,
          message:"your one event is ended",
          href:hre,
          isread:false,
        });
        Notification.addNewNotification(newNotification,function(err,notification){if(err) throw err;});
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
    Event.updateEvents(event._id,function(err,event){
          res.redirect('/emanagers/dashboard');      
    });
  });
});







module.exports = router;