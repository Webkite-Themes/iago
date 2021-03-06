// Use Case Model
var UseCaseModel = function() { this.value = []; };

UseCaseModel.prototype.create = function(properties) {
  return Iago.UseCase.create({
    name: properties.name,
    description: properties.description,
    icon: properties.icon,
    spreadsheetKey: properties.spreadsheetKey,
    datasetUuid: properties.datasetUuid,
    themes: properties.themes
  });
};

UseCaseModel.prototype.all = function() {
  return this.value;
};

UseCaseModel.prototype.find = function(useCaseName) {
  return _(this.value).find(function(useCase) {
    return useCase.get('name') === useCaseName;
  });
};

UseCaseModel.prototype.push = function(useCase) {
  if (this.find(useCase.get('name'))) {
    return false;
  } else {
    this.value.push(useCase);
    return true;
  }
};

UseCaseModel.prototype.addTheme = function(useCaseName, themeName) {
  // This is not the right way to add something to an array in Ember,
  // but it works and allows ember to properly observe the array.
  // (addObject and pushObject didn't seem to work)
  var useCase = this.find(useCaseName);
  if (useCase.get('themes')) {
    var newThemeArray = useCase.get('themes').toArray();
    newThemeArray.push(themeName);
    useCase.set('themes', newThemeArray);
  } else {
    useCase.set('themes', [themeName]);
  }
};

UseCaseModel.prototype.update = function(updatedProperties) {
  if (!updatedProperties.name) {
    return false;
  } else {
    var useCaseModel = this.find(updatedProperties.name);
    useCaseModel.setProperties(updatedProperties);
    return this.save(useCaseModel);
  }
};

UseCaseModel.prototype.save = function(useCase) {
  return Ember.$.post('/use_cases/' + useCase.get('name'), useCase.getProperties('name', 'description', 'icon', 'datasetUuid', 'spreadsheetKey', 'themes'));
};

// Theme Model
var ThemeModel = function() { this.value = []; };

ThemeModel.prototype.create = function(properties) {
  return Iago.Theme.create({
    name: properties.name,
    org: properties.org,
    version: properties.version,
    useCaseName: properties.useCaseName
  });
};

ThemeModel.prototype.all = function() {
  return this.value;
};

ThemeModel.prototype.find = function(themeName) {
  return _(this.value).find(function(theme) {
    return theme.get('name') === themeName;
  });
};

ThemeModel.prototype.findAll = function(themeNames) {
  if (!themeNames)
    return [];
  return _(this.value).filter(function(theme) {
    return themeNames.indexOf(theme.get('name')) >= 0;
  }).value();
};

ThemeModel.prototype.push = function(theme) {
  if (this.find(theme.get('name'))) {
    return false;
  } else {
    this.value.push(theme);
    return true;
  }
};

ThemeModel.prototype.update = function(properties) {
};

ThemeModel.prototype.save = function() {
};

// Instantiate
Iago.UseCaseModel = new UseCaseModel();
Iago.ThemeModel = new ThemeModel();
