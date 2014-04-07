var fs = require('fs'),
    _ = require('lodash');

folders = fs.readdirSync(process.cwd());

themes = _(folders).reject(function(file) {
  var stats = fs.statSync(file),
      reject = false;
  reject = (stats.isDirectory() ? false : true);
  reject = reject || !fs.existsSync([file, 'manifest.yml'].join('/'));
  return reject;
}).value();

module.exports = {
  themes: themes
};
