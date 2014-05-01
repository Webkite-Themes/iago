"use strict";

window.Iago = Ember.Application.create();

Iago.ApplicationController = Ember.Controller.extend({
  currentUser: null,
});

Iago.ApplicationRoute = Ember.Route.extend({
  setupController: function(controller) {
    var userData = localStorage.getItem('webkiteAuthData');
    if (userData) {
      controller.set('currentUser', Iago.User.create(JSON.parse(userData)));
    }
  },
  actions: {
    login: function() {
      var controller = this.controllerFor('index');
      Iago.oauth = Ember.OAuth2.create({ providerId: 'webkite' });
      Iago.oauth.authorize();
      Iago.oauth.on('success', function(stateObj) {
        Ember.$.ajax({
          url: 'http://localhost:9000/me',
          headers: {
            'X-Webkite-Client-ID': Ember.OAuth2.config.webkite.clientId,
            'Accept': 'application/vnd.webkite.auth.v1+json',
            'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token-webkite')).access_token
          },
          success: function(userData) {
            localStorage.setItem('webkiteAuthData', JSON.stringify({
              name: userData.name,
              email: userData.email
            }));
            controller.set('currentUser', Iago.User.create(userData));
          },
          error: function(xhr) {
            Ember.Logger.error(err);
          }
        });
      });
      Iago.oauth.on('error', function(err) {
        Ember.Logger.error(err);
      });
    },
    logout: function() {
      var controller = this.controllerFor('index');
      controller.set('currentUser', null);
      localStorage.removeItem('webkiteAuthData');
      localStorage.removeItem('token-webkite');
    }
  }
});
