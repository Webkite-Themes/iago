
var load = require('../load');
var themes = load.themes;
var config = load.config();
var themeRoutes = require('./themes');
var authRoutes = require('./auth');

/*
 * GET home page.
 */

exports.index = function(req, res){
  config = load.config(); // refresh config

  if (config.clientId) {
    res.render('index', { title: 'Iago (WebKite)', themes: themes, clientId: config.clientId });
  } else {
    res.redirect('/initialize');
  }
};

exports.theme = themeRoutes;
exports.auth = authRoutes;
