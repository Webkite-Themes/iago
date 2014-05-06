'use strict';

var fs = require('fs'),
    _ = require('lodash');
    //rsvp = require('rsvp');

var _save,
    saveConfig,
    overwriteConfig,
    loadConfig,
    deleteConfigKey;

_save = function(config, fileLocation) {
  // TODO: convert _save to a promise
  fs.writeFileSync(fileLocation, JSON.stringify(config, null, 2));
  return config;
};

saveConfig = function(newConfig, oldConfig, fileLocation) {
  var config = _.merge(oldConfig, newConfig, function(prev, next) {
    return next ? next : prev;
  });
  return _save(config, fileLocation);
};

overwriteConfig = function(config, fileLocation) {
  return _save(config, fileLocation);
};

loadConfig = function(fileLocation) {
  // TODO: convert loadConfig to a promise
  var config = null;
  try {
    config = JSON.parse(fs.readFileSync(fileLocation));
  } catch (err) {
    // we don't want to break on bad config files, just don't load them
    // TODO: tell someone that a config file is not parseable
    console.log(err);
  }
  return config;
};

deleteConfigKey = function(configKey, fileLocation) {
  // TODO: convert deleteConfigKey to a promise
  var config = loadConfig(fileLocation);
  delete config[configKey];
  return _save(config, fileLocation);
};

module.exports = {
  saveConfig: saveConfig,
  overwriteConfig: overwriteConfig,
  loadConfig: loadConfig,
  deleteConfigKey: deleteConfigKey
};
