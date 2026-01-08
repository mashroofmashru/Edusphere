var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

//for .env file
const dotenv = require("dotenv");
dotenv.config();

var instructorRouter = require('./routes/instructor');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin')
var authRouter = require('./routes/auth')
var paymentRouter = require('./routes/payment')

var app = express();

// for react server
app.use(cors({ origin: 'http://localhost:5173' }));

app.use(logger('dev'));
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl.includes('/payment/webhook')) {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/users', usersRouter);
app.use('/instructor', instructorRouter);
app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/payment', paymentRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(req.app.get('env') === 'development' && { stack: err.stack }),
  });
});


module.exports = app;
