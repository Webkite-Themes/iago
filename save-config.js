var fs = require('fs'),
    path = require('path'),
    savePath = require('./load').config.themePath;

var save;

save = function(config) {
  var fileName = path.join(savePath, '.iago', 'config.json');
  fs.writeFileSync(fileName, JSON.stringify(config, null, 2));
};

module.exports = {
  save: save
}
