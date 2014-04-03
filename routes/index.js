
var themes = require('../load').themes;
var themeRoutes = require('./themes');
var authRoutes = require('./auth');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Iago (WebKite)', themes: themes });
};

exports.theme = themeRoutes;
exports.auth = authRoutes;
