
var path = require('path'),
    fs = require('fs'),
    rsvp = require('rsvp'),
    _ = require('lodash');

/*
 * GET home page.
 */

exports.index = function(req, res){
  fs.readdir(process.cwd(), function(err, files) {
    if (err) { throw err; }
    files = _(files).reject(function(file) {
      console.log(file);
      var stats = fs.statSync(file),
          reject = false;
      reject = (stats.isDirectory() ? false : true);
      console.log(stats.isDirectory());
      reject = reject || _(['node_modules', 'public', 'routes', 'views', '.git']).contains(file);
      return reject;
    }).value();

    res.render('index', { title: 'Iago (WebKite)', themes: files });
  });
};
