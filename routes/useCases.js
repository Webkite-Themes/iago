var app = require('../load'),
    useCases = app.useCases;

exports.index = function(req, res){
  res.json(app.useCases);
};

exports.create = function(req, res){
  // TODO: save the use case
  app.useCases.push(req.body);
  res.json(app.useCases);
};

