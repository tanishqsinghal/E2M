var express = require('express');
//var fileUpload = require('express-fileupload');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var smtpTransport=require("nodemailer-smtp-transport");
var nodemailer=require("nodemailer");
var passport = require('passport');
var expressValidator = require('express-validator');
var localStrategy = require('passport-local').Strategy;
var multer = require('multer');
//var upload = multer({dest: './uploads'});
var flash = require('req-flash');
var bcrypt = require('bcryptjs');
var mongo = require('mongodb');
var ejs = require('ejs');
var mongoose = require('mongoose');
var db = mongoose.connection;

var tagsInput = require('tags-input');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var artistsRouter = require('./routes/artists');
var searchRouter = require('./routes/scrh');
var serviceRouter = require('./routes/services');
var testRouter = require('./routes/test');
var emanagerRouter = require('./routes/emanagers');
var instituteRouter = require('./routes/institutes');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//app.use(fileUpload());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Handle Sessions
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

app.use(flash());




//Passport
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.'),
		root = namespace.shift(),
		formParam = root;
		while(namespace.length){
		formParam += '[' + namespace.shift() + ']';
	}
	return {
		param : formParam,
		msg : msg,
		value : value
	};
	}
}));


app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*', function(req, res, next){
	res.locals.user = req.user || null;
	next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/artists', artistsRouter);
app.use('/scrh', searchRouter);
app.use('/services', serviceRouter);
app.use('/test', testRouter);
app.use('/emanagers', emanagerRouter);
app.use('/institutes', instituteRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const port = 3000;

app.listen(port, () => console.log('server started on port ' + port));

module.exports = app;
