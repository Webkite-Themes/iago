
var themes = require('../load').themes;

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Iago (WebKite)', themes: themes });
};
