
/**
 * Module dependencies.
 */

var express = require('express');
var load = require('./load');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 1460);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon(path.join(__dirname, 'public', 'images', 'webkite_favicon.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('node-sass').middleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  outputStyle: 'compressed',
  debug: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/oauth/callback', routes.auth.callback);
app.get('/initialize', routes.auth.initialize);
app.get('/finalize', routes.auth.finalize);
app.post('/finalize', routes.auth.saveConfig);
app.get('/themes', routes.theme.index);
app.post('/themes', routes.theme.create);
app.get('/themes/iago/:theme/:version/all.js', routes.theme.theme);
app.get('/themes/iago/:theme/:version/assets/:file', routes.theme.asset);
app.get('/themes/iago/:theme/:version/manifest.json', routes.theme.manifest);

app.get('/use_cases', routes.useCases.index);
app.post('/use_cases', routes.useCases.create);
app.get('/use_cases/:useCaseName', routes.useCases.get);
app.post('/use_cases/:useCaseName', routes.useCases.update);

app.get('/preview/:useCaseName/:theme', routes.theme.preview);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Iago is listening on port ' + app.get('port'));
  console.log('open localhost:' + app.get('port') + ' in your browser to get started');
});
