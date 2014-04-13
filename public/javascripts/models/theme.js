'use strict';

Iago.Theme = Ember.Object.extend({
  name: null,
  org: null,
  version: null,

  fullName: function() {
    return [this.get('org'), this.get('name'), this.get('version')].join('/');
  }.property('name', 'org', 'version'),
});
