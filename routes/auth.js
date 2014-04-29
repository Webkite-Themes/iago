var request = require('request'),
    saveConfig = require('../load').save;

exports.callback = function(req, res){
  res.render('auth/callback');
};

exports.initialize = function(req, res){
  res.render('auth/initialize', {
    tempId: _makeId.generate(),
    callbackUrl: encodeURIComponent('http://localhost:1460/finalize'),
    redirectUri: encodeURIComponent('http://localhost:1460/oauth/callback')
  });
};

exports.finalize = function(req, res){
  var options = {
    headers: {
      'Accept': 'application/vnd.webkite.auth.v1+json',
      'Authorization': 'Bearer ' + _makeId.value
    },
    url: 'http://localhost:9000/iago',
    method: 'POST'
  };

  request(options, function(error, response, body) {
    if (error)
      console.log(error);
    else {
      if (response.statusCode != 200)
        console.log(response);
      _makeId.destroy();
      res.render('auth/finalize', {
        clientId: JSON.parse(body).client_id
      });
    }
  });
};

exports.saveConfig = function(req, res){
  saveConfig({clientId: req.body.clientId});
  res.redirect('/');
};

// Helpers
_makeId = {
  generate: function() {
    var alphabet = '0123456789abcdef';

    for (var i=0; i < 32; i++) {
      this.value += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }

    return this.value;
  },
  value: '',
  destroy: function() {
    this.value = '';
  }
};
