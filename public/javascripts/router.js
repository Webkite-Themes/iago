Iago.Router.map(function() {
  this.resource('use_cases', function() {
    this.route('new');
    this.resource('use_case', { path: ':use_case_name' }, function() {
      this.resource('themes');
    });
  });
});

Iago.UseCasesRoute = Ember.Route.extend({
  beforeModel: function() {
    Ember.$('#use_cases_link').append('<img class="loading-img" src="/images/loading.gif" />');
  },
  afterModel: function() {
    Ember.$('#use_cases_link .loading-img').remove();
  },
  model: function() {
    if (Iago.UseCaseModel.value.length > 0)
      return Iago.UseCaseModel.value;

    var publicUseCases = new Promise(function(resolve, reject) {
      Ember.$.ajax({
        url: adminUrl + '/use_cases',
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
        Iago.UseCaseModel.value = useCases[0].concat(useCases[1]).sort(function(a, b) {
          // sort lists alphabetically by name
          var aSort = a.name.toLowerCase(),
              bSort = b.name.toLowerCase();
          return (aSort < bSort) ? -1 : (aSort > bSort) ? 1 : 0;
        });
        resolve(Iago.UseCaseModel.value);
      });
    });
  }
});

Iago.UseCaseRoute = Ember.Route.extend({
  model: function(params) {
    return Iago.UseCaseModel.find(params.use_case_name);
  }
});

Iago.ThemesRoute = Ember.Route.extend({
  model: function() {
    if (!Iago.ThemeModel.value.length) {
      var _this = this;
      return new Promise(function(resolve, reject) {
        Ember.$.getJSON('/themes').then(function(data) {
          Iago.ThemeModel.value = data.map(function(theme) {
            return Iago.Theme.create({
              org: 'iago',
              name: theme,
              version: 'master'
            });
          });
          resolve(Iago.ThemeModel.findAll(_this.modelFor('use_case').themes));
        });
      });
    }
    return Iago.ThemeModel.findAll(this.modelFor('use_case').themes);
  }
});
