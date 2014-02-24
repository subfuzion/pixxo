// ===========================================================================
// REST API
// ===========================================================================

const
  express = require('express'),
  http = require('http'),
  Promise = require('bluebird'),
  pixxo = Promise.promisifyAll(require('./lib'));

var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});

app.get('/', function (req, res) {
  var credentials = {};

  pixxo.authenticateAsync(credentials).then(function(user) {
    res.json({ status: 'OK', user: user });
  });
});


