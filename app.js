var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const multer = require('multer');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var imageRouter = require('./routes/image');

var app = express();

//database setup
mongoose.connect(
  process.env.MONGODB_URL,
  {
    family:4,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(()=> console.log("Connected to MongoDB.."))
.catch((err)=> console.error("MongoDB Connection Failed.."));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//cors
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/image", imageRouter);

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
//port 3000
module.exports = app;
