'use strict';

var sass = require('node-sass'),
    hbs = require('handlebars'),
    path = require('path'),
    fs = require('fs'),
    yaml = require('js-yaml'),
    _ = require('lodash'),
    rsvp = require('rsvp');

function findFiles(manifest, type, themeDir) {
  var templates = _(manifest[type]).map(function(filename) {
    var filename = filename.split('.').shift();
    return new rsvp.Promise(function(resolve, reject) {
      fs.readFile(path.join(themeDir, filename + '.hbs'), { encoding: 'utf8' }, function(err, data) {
        if (err) {
          var alt = filename + '.handlebars';
          fs.readFile(path.join(themeDir, alt), { encoding: 'utf8' }, function(err, data) {
            if (err) {
              reject(err);
            } else {
              resolve({ name: filename, type: type, content: data });
            }
          });
        } else {
          resolve({ name: filename, type: type, content: data });
        }
      });
    });
  }).value();
  return rsvp.all(templates);
}

function wrapTemplates(templates) {
  var js = "(function() { var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {}; partials = Handlebars.partials = Handlebars.partials || {};";
  _(templates).each(function(template) {
    js = js + template.type + '["' + template.name + '"] = template(' + template.content + ');'
  });
  js = js + '})();';
  return js;
}

exports.preview = function(req, res){
  res.render('themes/preview', { theme: req.params.theme });
};

exports.asset = function(req, res){
  var themeDir = path.join(process.cwd(), req.params.theme),
      filename = req.params.file,
      filepath = path.join(themeDir, filename);

  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Expires', 0);

  if (filename.split('.').pop() === 'css') {
    res.set('Content-Type', 'text/css');
    fs.exists(filepath, function(exists) {
      if (exists) {
        res.sendfile(filepath);
      } else {
        sass.render({
          file: filepath.replace(/\.css$/, '.scss'),
          success: function(css) { res.send(css); },
          error: function(error) { console.log(error); }
        });
      }
    });
  } else {
    res.sendfile(filepath);
  }
};

exports.manifest = function(req, res) {
  var themeDir = path.join(process.cwd(), req.params.theme),
      manifestPath = path.join(themeDir, 'manifest.yml'),
      manifest;

  manifest = yaml.safeLoad(fs.readFileSync(manifestPath, {encoding: 'utf8'}));

  res.set('Content-Type', 'application/json');
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Expires', 0);
  res.send(JSON.stringify(manifest));
}

exports.theme = function(req, res) {
  var themeDir = path.join(process.cwd(), req.params.theme),
      manifestPath = path.join(themeDir, 'manifest.yml'),
      files,
      manifest;

  manifest = yaml.safeLoad(fs.readFileSync(manifestPath, {encoding: 'utf8'}));

  files = {
    templates: findFiles(manifest, 'templates', themeDir),
    partials: findFiles(manifest, 'partials', themeDir)
  }

  rsvp.hash(files).then(function(results) {
    results = results.templates.concat(results.partials);
    _(results).each(function(template) {
      template.content = hbs.precompile(template.content);
    });
    res.set('Content-Type', 'application/javascript');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Expires', 0);
    res.send(wrapTemplates(results));
  }).catch(function(err) { throw err; });

};
