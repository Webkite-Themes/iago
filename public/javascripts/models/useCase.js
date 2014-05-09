'use strict';

Iago.UseCase = Ember.Object.extend({
  name: null,
  icon: null,
  description: null,
  spreadsheetKey: null,
  datasetUuid: null,
  themes: [],

  spreadsheetUrl: function() {
    return "https://docs.google.com/a/webkite.com/spreadsheet/ccc?key=" + this.get('spreadsheetKey');
  }.property('spreadsheetKey')
});
