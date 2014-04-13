Iago.ThemesController = Ember.ArrayController.extend({
  actions: {
    previewTheme: function(theme) {
      Ember.$.get(['', 'themes', theme, 'preview'].join('/'), function(data) {
        Ember.$(data).appendTo('body');
      });
    }
  }
});
