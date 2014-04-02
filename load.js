var fs = require('fs'),
    _ = require('lodash');

folders = fs.readdirSync(process.cwd());

// TODO: Determine if subfolder is a theme folder (check for manifest?)
themes = _(folders).reject(function(file) {
  var stats = fs.statSync(file),
      reject = false;
  reject = (stats.isDirectory() ? false : true);
  reject = reject || _(['node_modules', 'public', 'routes', 'views', '.git']).contains(file);
  return reject;
}).value();

module.exports = {
  themes: themes
};
