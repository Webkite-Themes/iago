Iago.Router.map(function() {
  this.resource('themes', function() {
    this.route('preview', { path: '/:theme/preview' });
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
