'use strict';

var fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

var folders,
    themes,
    config;

folders = fs.readdirSync(process.cwd());

themes = _(folders).reject(function(file) {
  var stats = fs.statSync(file),
      isTheme = false,
      reject = false;
  reject = (stats.isDirectory() ? false : true);
  return reject || !fs.existsSync(path.join(file, 'manifest.yml'));
}).value();

//config = fs.readFileSync();

module.exports = {
  themes: themes
};
