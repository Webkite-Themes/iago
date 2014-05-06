var app = require('../load'),
    useCases = app.useCases,
    h = require('../configHelpers');

exports.index = function(req, res){
  res.json(app.useCases);
};

exports.create = function(req, res){
  h.overwriteConfigWithPath(req.body, app.config().configPath, req.body.name + '.json');
  app.useCases.push(req.body);
  res.json(app.useCases);
};

