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

