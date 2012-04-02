
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , util = require('util')
  , myconsole = require('myconsole')
  , config = require('./config')
  , RedisStore = require('connect-redis')(express);

// apply configuration
myconsole.replace();

var app = module.exports = express.createServer();

var development = app.settings.env == 'development'

// Configuration
app.configure('development', function() {
    app.use(express.logger({ format: ':method :url :status' }));
});

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {pretty: development, layout: false});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "keyboard cat", store: new RedisStore }));
  // app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  // app.use(express.static(__dirname + '/public'));
});

// app.get('/assets/*', express.compiler({ src: __dirname + '/public', enable: ['less'] }));
// use connect-less for @import
app.get('/assets/*', require('connect-less')({ src: __dirname + '/public/', compress: !development }));

app.get('/*', express.static(__dirname + '/public'));

app.configure('development', function(){
  // app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  // app.use(express.errorHandler()); 
});

app.locals({
    title: 'HD-images'
  , debug: app.settings.env == 'development'
  , config: config
});

app.dynamicHelpers({
    username: function(req) {return req.session.username}
  , url: function(req) {return req.url}
});

app.use(function(err, req, res, next) {
    myconsole.traceError(err);
    next(err);
});

// Routes

routes(app);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
