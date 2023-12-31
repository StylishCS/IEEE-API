const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const passport = require('passport');
const cookieSession = require("cookie-session");
const passportSetup = require("./passport");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const coursesRouter = require('./routes/courses');
const dashboardRouter = require('./routes/dashboard');


const app = express();

app.use(
  cookieSession({
    name: "session",
    keys: ["cyberwolve"],
    maxAge: 24 * 60 * 60 * 100,
  })
);

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

app.use(passport.initialize());
app.use(passport.session());


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/courses', coursesRouter);
app.use("/dashboard", dashboardRouter);


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
