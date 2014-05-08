var app = require('../load'),
    useCases = app.useCases,
    h = require('../configHelpers');

exports.index = function(req, res){
  res.json(app.useCases);
};

exports.create = function(req, res){
  // TODO: do this check in ember, before hitting the route
  if (h.loadConfigWithPathConverted(app.config().configPath, req.body.name + '.json')) {
      res.send(409, 'Conflict: Use Case Already Exists');
  } else {
    h.overwriteConfigWithPath(req.body, app.config().configPath, req.body.name + '.json');
    app.useCases.push(req.body);
    res.json(app.useCases);
  }
};

exports.update = function(req, res){
  if (req.params.useCase != req.body.name) {
    res.send(409, 'Conflict: Use Case does not match Use Case\'s Name');
  } else {
    var useCaseConfig = h.loadConfigWithPathConverted(app.config().configPath, req.params.useCase + '.json');
    if (useCaseConfig) {
      var updatedConfig = h.saveConfigWithPath(req.body, useCaseConfig, app.config().configPath, req.body.name + '.json');
      res.json(updatedConfig);
    } else {
      res.send(404, 'Config not found');
    }
  }
};

