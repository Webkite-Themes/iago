'use strict';

var fs = require('fs'),
    path = require('path'),
    _ = require('lodash');
    //rsvp = require('rsvp');

var _save,
    saveConfig,
    loadConfig,
    deleteConfigKey;

_save = function(config, filePath, fileName) {
  // TODO: convert _save to a promise
  var fileName = path.join(filePath, fileName);
  fs.writeFileSync(fileName, JSON.stringify(config, null, 2));
  return config;
};

saveConfig = function(newConfig, oldConfig, filePath, fileName) {
  config = _.merge(oldConfig, newConfig, function(prev, next) {
    return next ? next : prev;
  });
  return _save(config, filePath, fileName);
};

loadConfig = function(filePath, fileName) {
  // TODO: convert loadConfig to a promise
  var config = null;
  try {
    config = JSON.parse(fs.readFileSync(path.join(configFolder, useCaseFileName)));
  } catch (err) {
    // we don't want to break on bad config files, just don't load them
    // TODO: tell someone that a config file is not parseable
    console.log(err);
  }
  return config;
};

deleteConfigKey = function(configKey, filePath, fileName) {
  // TODO: convert deleteConfigKey to a promise
  var config = loadConfig(filePath, fileName);
  delete config[configKey];
  return _save(config, filePath, fileName);
};

module.exports = {
  saveConfig: saveConfig,
  loadConfig: loadConfig,
  deleteConfigKey: deleteConfigKey
};
