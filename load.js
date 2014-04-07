'use strict';

var fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

var folders,
    themes,
    iago,
    config;

fs.mkdir(path.join(process.cwd(), '.iago'), function(err) {
  var configPath = path.join(process.cwd(), '.iago', 'config.json');
  fs.readFile(configPath, function(err, data) {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.writeFile(configPath, JSON.stringify({}));
        config = {};
      } else { throw err; }
    } else {
      config = JSON.parse(data);
    }
  });
});

folders = fs.readdirSync(process.cwd());

themes = _(folders).reject(function(file) {
  var stats = fs.statSync(file),
      isTheme = false,
      reject = false;
  reject = (stats.isDirectory() ? false : true);
  return reject || !fs.existsSync(path.join(file, 'manifest.yml'));
}).value();


module.exports = {
  config: config,
  themes: themes
};
