'use strict';

var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    rsvp = require('rsvp');

var themePath,
    configFolder,
    configPath,
    loadConfig,
    themeFolders,
    themes,
    useCaseFiles,
    useCaseNames,
    useCases,
    config,
    save,
    started = false;

themePath = (function() {
  var segments = process.cwd().split(path.sep);
  if (segments.indexOf('node_modules') > -1) {
    return segments.slice(0,segments.indexOf('node_modules')).join(path.sep);
  } else {
    return process.cwd();
  }
})();

configFolder = path.join(themePath, '.iago');
configPath = path.join(configFolder, 'config.json');

loadConfig = function() {
  if (!started) {
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
    started = true;
    return config;
  } else {
    return config;
  }
};
loadConfig();

config.themePath = themePath;

themeFolders = fs.readdirSync(themePath);

themes = _(themeFolders).reject(function(file) {
  var stats = fs.statSync(path.join(themePath, file)),
      isTheme = false,
      reject = false;
  reject = (stats.isDirectory() ? false : true);
  return reject || !fs.existsSync(path.join(themePath, file, 'manifest.yml'));
}).value();

useCaseFiles = fs.readdirSync(configFolder);

useCaseNames = _(useCaseFiles).reject(function(file) {
  var stats = fs.statSync(path.join(configFolder, file));
  return stats.isDirectory() || (file == 'config.json');
}).value();

useCases = _(useCaseNames).map(function(useCaseFileName) {
  var useCase = null;
  try {
    useCase = JSON.parse(fs.readFileSync(path.join(configFolder, useCaseFileName)));
  } catch (err) {
    // we don't want to break on bad config files, just don't load them
    // TODO: tell someone that a config file is not parseable
    console.log(err);
  }
  return useCase;
}).filter().value();


save = function(newConfig) {
  config = _.merge(config, newConfig, function(prev, next) {
    return next ? next : prev;
  });
  var fileName = path.join(themePath, '.iago', 'config.json');
  fs.writeFileSync(fileName, JSON.stringify(config, null, 2));
};

module.exports = {
  config: loadConfig,
  themes: themes,
  useCases: useCases,
  save: save
};
