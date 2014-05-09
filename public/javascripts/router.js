Iago.Router.map(function() {
  this.resource('themes', function() {
    this.route('preview', { path: '/:theme/preview' });
  });
  this.resource('use_cases', function() {
    this.route('new');
  });
});

Iago.ThemesRoute = Ember.Route.extend({
  model: function() {
    return Ember.$.getJSON('/themes').then(function(data) {
      return data.map(function(theme) {
        return Iago.Theme.create({
          org: 'iago',
          name: theme,
          version: 'master'
        });
      });
    });
  }
});

Iago.UseCasesRoute = Ember.Route.extend({
  model: function() {
    var publicUseCases = new Promise(function(resolve, reject) {
      Ember.$.ajax({
        url: 'http://' + adminUrl + '/use_cases',
        type: 'GET',
        headers: {
          'X-Webkite-Client-ID': Ember.OAuth2.config.webkite.clientId,
          'Accept': 'application/vnd.webkite.config+json; version=1',
          'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token-webkite')).access_token
        }
      }).then(function(data) {
        var use_cases = [];
        $.each(data.use_cases, function(i, use_case) {
          use_cases.push(Iago.UseCase.create({
            name: use_case.name,
            description: use_case.description,
            icon: use_case.icon
          }));
        });
        resolve(use_cases);
      });
    });
    var localUseCases = new Promise(function(resolve, reject) {
      Ember.$.ajax({
        url: 'http://localhost:1460/use_cases',
        type: 'GET'
      }).then(function(data) {
        var use_cases = [];
        $.each(data, function(i, use_case) {
          use_cases.push(Iago.UseCase.create({
            name: use_case.name,
            description: use_case.description,
            icon: use_case.icon,
            spreadsheetKey: use_case.spreadsheetKey,
            datasetUuid: use_case.datasetUuid,
            themes: use_case.themes
          }));
        });
        resolve(use_cases);
      });
    });
    return new Promise(function(resolve, reject) {
      Promise.all([publicUseCases, localUseCases])
        .then(function(useCases) {
          resolve(useCases[0].concat(useCases[1]).sort(function(a, b) {
            // sort lists alphabetically by name
            var aSort = a.name.toLowerCase(),
                bSort = b.name.toLowerCase();
            return (aSort < bSort) ? -1 : (aSort > bSort) ? 1 : 0;
          }));
        });
      });
  }
});
