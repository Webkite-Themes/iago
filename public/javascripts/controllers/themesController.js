Iago.ThemesController = Ember.ArrayController.extend({
  actions: {
    create: function() {
      var name = this.get('newThemeName'),
          controller = this;
      if (!name.trim()) { return; }

      var theme = Iago.Theme.create({
        org: 'iago',
        name: name,
        version: 'master'
      });
      Ember.$.post('/themes', { name: name }, function(data) {
        controller.content.addObject(theme);
        console.log(controller.content);
      });
    }
  }
});
