'use strict';

var fs = require('fs'),
    path = require('path'),
    _ = require('lodash');
    //rsvp = require('rsvp');

var _convertSpacesToSomething,
    _save,
    saveConfig,
    saveConfigWithPath,
    overwriteConfig,
    overwriteConfigWithPath,
    loadConfig,
    loadConfigWithPath,
    loadConfigWithPathConverted,
    deleteConfigKey;

_convertSpacesToSomething = function(string, convertTo) {
  var delimeter = '-';
  if (convertTo && convertTo != ' ') {
    delimeter = convertTo;
  }
  return string.replace(/\ /g, delimeter);
};

_save = function(config, fileLocation) {
  // TODO: convert _save to a promise
  fs.writeFileSync(_convertSpacesToSomething(fileLocation), JSON.stringify(config, null, 2));
  return config;
};

saveConfig = function(newConfig, oldConfig, fileLocation) {
  var config = _.merge(oldConfig, newConfig, function(prev, next) {
    return next ? next : prev;
  });
  return _save(config, fileLocation);
};

saveConfigWithPath = function(newConfig, oldConfig, filePath, fileName) {
  return saveConfig(newConfig, oldConfig, path.join(filePath, _convertSpacesToSomething(fileName)));
};

overwriteConfig = function(config, fileLocation) {
  return _save(config, fileLocation);
};

overwriteConfigWithPath = function(config, filePath, fileName) {
  return overwriteConfig(config, path.join(filePath, _convertSpacesToSomething(fileName)));
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

loadConfigWithPath = function(filePath, fileName) {
  return loadConfig(path.join(filePath, fileName));
};

loadConfigWithPathConverted = function(filePath, fileName) {
  return loadConfigWithPath(filePath, _convertSpacesToSomething(fileName));
};

deleteConfigKey = function(configKey, fileLocation) {
  // TODO: convert deleteConfigKey to a promise
  var config = loadConfig(fileLocation);
  delete config[configKey];
  return _save(config, fileLocation);
};

module.exports = {
  saveConfig: saveConfig,
  saveConfigWithPath: saveConfigWithPath,
  overwriteConfig: overwriteConfig,
  overwriteConfigWithPath: overwriteConfigWithPath,
  loadConfig: loadConfig,
  loadConfigWithPath: loadConfigWithPath,
  loadConfigWithPathConverted: loadConfigWithPathConverted,
  deleteConfigKey: deleteConfigKey
};
