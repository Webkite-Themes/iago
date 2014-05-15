Iago.ThemesController = Ember.ArrayController.extend({
  needs: 'use_case',
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

      if (!Iago.ThemeModel.find(name)) {
        Ember.$.post('/themes', { name: name }, function(data) {
          console.log(controller.content);
        });
      }

      controller.content.addObject(theme);

      Iago.UseCaseModel.addTheme(this.get('controllers.use_case.name'), name);
      Iago.UseCaseModel.save(this.get('controllers.use_case'));
    }
  }
});
