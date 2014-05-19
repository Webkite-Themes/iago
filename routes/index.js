
var app = require('../load');
var themes = app.themes;
var themeRoutes = require('./themes');
var authRoutes = require('./auth');
var useCases = require('./useCases');

/*
 * GET home page.
 */

exports.index = function(req, res){
  if (app.config().clientId) {
    res.render('index', {
      title: 'Iago (WebKite)',
      themes: themes,
      clientId: app.config().clientId,
      authUrl: app.config().authUrl,
      adminUrl: app.config().adminUrl
    });
  } else {
    res.redirect('/initialize');
  }
};

exports.theme = themeRoutes;
exports.auth = authRoutes;
exports.useCases = useCases;
