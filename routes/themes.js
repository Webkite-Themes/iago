'use strict';

var sass = require('node-sass'),
    path = require('path'),
    fs = require('fs');

exports.preview = function(req, res){
  res.render('themes/preview', { theme: req.params.theme });
};

exports.asset = function(req, res){
  var themeDir = path.join(process.cwd(), req.params.theme),
      filename = req.params.file,
      filepath = path.join(themeDir, filename);
  if (filename.split('.').pop() === 'css') {
    fs.exists(filepath, function(exists) {
      if (exists) {
        res.sendfile(filepath);
      } else {
        sass.render({
          file: filepath.replace(/\.css$/, '.scss'),
          success: function(css) { res.send(css); },
          error: function(error) { console.log(error); }
        });
      }
    });
  } else {
    res.sendfile(filepath);
  }
};
