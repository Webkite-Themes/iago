var app = require('../load'),
    h = require('../configHelpers');

exports.index = function(req, res){
  res.json(app.useCases());
};

exports.create = function(req, res){
  // TODO: do this check in ember, before hitting the route
  if (h.loadConfigWithPathConverted(app.config().configPath, req.body.name + '.json')) {
      res.send(409, 'Conflict: Use Case Already Exists');
  } else {
    h.overwriteConfigWithPath(req.body, app.config().configPath, req.body.name + '.json');
    app.updateUseCases();
    res.json(app.useCases());
  }
};

// param: useCaseName
exports.get = function(req, res){
  var useCase = app.useCases().filter(function(useCase) {
    return useCase.name.toLowerCase() === req.params.useCaseName.toLowerCase();
  });
  if (useCase.length === 1) {
    res.json(useCase[0]);
  } else {
    res.send(404, "Use Case not found");
  }
};

// param: useCaseName
exports.update = function(req, res){
  if (req.params.useCaseName != req.body.name) {
    res.send(409, 'Conflict: Use Case does not match Use Case\'s Name');
  } else {
    var useCaseConfig = h.loadConfigWithPathConverted(app.config().configPath, req.params.useCaseName + '.json');
    if (useCaseConfig) {
      var updatedConfig = h.saveConfigWithPath(useCaseConfig, req.body, app.config().configPath, req.body.name + '.json');
      app.updateUseCases();
      res.json(updatedConfig);
    } else {
      res.send(404, 'Config not found');
    }
  }
};

