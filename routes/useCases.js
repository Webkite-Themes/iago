var app = require('../load'),
    useCases = app.useCases;

exports.index = function(req, res){
  res.json(app.useCases);
};

