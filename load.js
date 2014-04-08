'use strict';

var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    rsvp = require('rsvp');

var themePath,
    configPath,
    folders,
    themes,
    config;

themePath = (function() {
  var segments = process.cwd().split(path.sep);
  if (segments.indexOf('node_modules') > -1) {
    return segments.slice(0,segments.indexOf('node_modules')).join(path.sep);
  } else {
    return process.cwd();
  }
})();

configPath = path.join(themePath, '.iago', 'config.json');
try {
  fs.mkdirSync(path.join(themePath, '.iago'));
} catch(err) {
  // swallow error if it's just '.iago directory already exists'
  if (!(err.code === 'EEXIST' && err.path === path.dirname(configPath))) {
    throw err;
  }
} finally {
  // yeah this is ugly, all the try/catch
  try {
    config = JSON.parse(fs.readFileSync(configPath));
  } catch(err) {
    if (err.code === 'ENOENT') {
      fs.writeFileSync(configPath, JSON.stringify({}));
      config = {};
    } else { throw err; }
  }
}

config.themePath = themePath;

folders = fs.readdirSync(themePath);

themes = _(folders).reject(function(file) {
  var stats = fs.statSync(path.join(themePath, file)),
      isTheme = false,
      reject = false;
  reject = (stats.isDirectory() ? false : true);
  return reject || !fs.existsSync(path.join(themePath, file, 'manifest.yml'));
}).value();

module.exports = {
  config: config,
  themes: themes
};
