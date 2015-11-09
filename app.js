require('dotenv').load();

let _             = require('lodash');
let express       = require('express');
let path          = require('path');
let app           = express();
let server        = require('http').Server(app);
let favicon       = require('static-favicon');
let logger        = require('morgan');
let bodyParser    = require('body-parser');
let cookieParser  = require('cookie-parser');
let assets        = require('connect-assets');


// configure modules

assets().environment.getEngines('.styl').configure((s) => {
  s.use(require('nib')());
});

app.locals._  = require('lodash');


// configure express middleware

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(assets({
  buildDir: 'assets/vendor',
  paths: [
    path.join(__dirname, 'assets', 'images'),
    path.join(__dirname, 'assets', 'scripts'),
    path.join(__dirname, 'assets', 'stylesheets'),
    path.join(__dirname, 'bower_components')
  ]
}));


// routes

// app

app.all('*', (req, res, next) => {
  _.extend(req.body, req.query);

  next();
});

app.use(require('./routes/index'));
app.use(require('./routes/calendar'));

// error handler

app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404
  next(err);
});

app.use((err, req, res, next) => {
  console.log(err.stack);

  res.status(err.status || 500);
  res.render('error', {
    message: `${err.message} (${err.status})`
  });
});


// run magic

server.listen(process.env.PORT || 3000);

module.exports = app;
