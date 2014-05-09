Iago.LocalUseCasesController = Ember.ArrayController.extend({
  actions: {
    publish: function(useCase) {
      var name = useCase.get('name');
      if (!name || !name.trim()) { return; }

      var adminHeaders = {
        'X-Webkite-Client-ID': Ember.OAuth2.config.webkite.clientId,
        'Accept': 'application/vnd.webkite.config+json; version=1',
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token-webkite')).access_token
      };

      startPublishAndGetJobId(useCase.get('spreadsheetKey'))
      .then(askForDatasetUuidUntilGiven)
      .then(saveDatasetUuid)
      .then(function(data) { console.log(data); })
      .catch(function(error) {
        console.log('ERROR:');
        console.log(error);
      });

      function startPublishAndGetJobId(spreadsheetKey) {
        return new Promise(function(resolve, reject) {
          Ember.$.ajax({
            url: 'http://' + adminUrl + '/spreadsheets/' + spreadsheetKey,
            type: 'POST',
            headers: adminHeaders
          }).done(function(data) {
            if (data.jid) {
              resolve({'key': spreadsheetKey, 'jid': data.jid});
            } else {
              reject('No job id returned');
            }
          }).fail(function(jqXHR, textStatus, errorThrown) {
            reject({'from': 'getting job id from admin', 'jqXHR': jqXHR, 'textStatus': textStatus, 'errorThrown': errorThrown});
          });
        });
      }

      function askForDatasetUuidUntilGiven(keyAndJobId) {
        return new Promise(function(resolve, reject) {
          function keepAsking(keyAndJobId) {
            Ember.$.ajax({
              url: 'http://' + adminUrl + '/spreadsheets/' + keyAndJobId.key + '/' + keyAndJobId.jid,
              type: 'GET',
              headers: adminHeaders
            }).done(function(data) {
              if (data.skeletor_response.status === 'complete') {
                resolve(data.skeletor_response.dataset_uuid);
              } else {
                // can't specify a timeout function with a parameter without wrapping it in a lambda
                setTimeout(function() { keepAsking(keyAndJobId); }, 2000);
              }
            }).fail(function(jqXHR, textStatus, errorThrown) {
              reject({'from': 'getting dataset uuid from admin', 'jqXHR': jqXHR, 'textStatus': textStatus, 'errorThrown': errorThrown});
            });
          }
          keepAsking(keyAndJobId);
        });
      }

      function saveDatasetUuid(datasetUuid) {
        useCase.set('datasetUuid', datasetUuid);
        var useCaseProperties = useCase.getProperties('name', 'description', 'icon', 'spreadsheetKey', 'datasetUuid', 'themes');
        return new Promise(function(resolve, reject) {
          Ember.$.post('/use_cases/' + name, useCaseProperties, function(data) {
            resolve(data);
          }).done(resolve).fail(function(jqXHR, textStatus, errorThrown) {
            reject({'from': 'saving dataset uuid', 'jqXHR': jqXHR, 'textStatus': textStatus, 'errorThrown': errorThrown});
          });
        });
      }
    }
  }
});
