Iago.UseCasesController = Ember.ArrayController.extend({
  actions: {
    sync: function(useCase) {
      var name = useCase.get('name');
      if (!name || !name.trim()) { return; }

      var adminHeaders = {
        'X-Webkite-Client-ID': Ember.OAuth2.config.webkite.clientId,
        'Accept': 'application/vnd.webkite.config+json; version=1',
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token-webkite')).access_token
      };

      startLoading('use_case_' + useCase.get('dashName'));

      startPublishAndGetJobId(useCase.get('spreadsheetKey'))
      .then(askForDatasetUuidUntilGiven)
      .then(saveDatasetUuid)
      .then(function(data) { endLoading('use_case_' + useCase.get('dashName')); })
      .catch(function(error) {
        endLoading('use_case_' + useCase.get('dashName'));
        console.log('ERROR:');
        console.log(error);
      });

      function startPublishAndGetJobId(spreadsheetKey) {
        return new Promise(function(resolve, reject) {
          Ember.$.ajax({
            url: adminUrl + '/spreadsheets/' + spreadsheetKey,
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
              url: adminUrl + '/spreadsheets/' + keyAndJobId.key + '/' + keyAndJobId.jid,
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
        return Iago.UseCaseModel.update(useCase.getProperties('name', 'description', 'icon', 'spreadsheetKey', 'datasetUuid', 'themes'));
      }
    }
  }
});

Iago.UseCasesNewController = Ember.ArrayController.extend({
  actions: {
    create: function() {
      var name = this.get('newUseCaseName'),
          description = this.get('newUseCaseDescription'),
          icon = this.get('newUseCaseIcon'),
          controller = this;
      if (!name || !name.trim()) { return; }

      var adminHeaders = {
        'X-Webkite-Client-ID': Ember.OAuth2.config.webkite.clientId,
        'Accept': 'application/vnd.webkite.config+json; version=1',
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token-webkite')).access_token
      };

      startLoading('new_use_case');

      getSpreadsheetTemplateId()
      .then(copySpreadsheetAndGetSpreadsheetKey)
      .then(createEmberUseCaseObject)
      .then(saveUseCase)
      .then(function(allLocalUseCases) {
        endLoading('new_use_case');
        controller.transitionToRoute('use_cases');
        return console.log(allLocalUseCases);
      })
      .catch(function(error) {
        endLoading('new_use_case');
        // TODO: properly handle the error
        console.log('ERROR:');
        console.log(error);
      });

      // The business logic
      function getSpreadsheetTemplateId() {
        return new Promise(function(resolve, reject) {
          Ember.$.ajax({
            url: adminUrl + '/spreadsheet_templates',
            type: 'GET',
            headers: adminHeaders
          }).done(function(data) {
            var templateSheet = _(data).where({'key': '0AnbfF2RBr5i5dGd3UE8zUVBzUXFBajFtTjRiSVNZUmc'}).value();
            if (templateSheet.length == 1) {
              resolve(templateSheet[0].id);
            }
            else {
              reject('No template spreadsheet exists (or too many exist)');
            }
          }).error(function(jqXHR, textStatus, errorThrown) {
            reject({'from': 'getting from admin spreadsheet_templates', 'jqXHR': jqXHR, 'textStatus': textStatus, 'errorThrown': errorThrown});
          });
        });
      }

      function copySpreadsheetAndGetSpreadsheetKey(spreadsheetTemplateId) {
        return new Promise(function(resolve, reject) {
          Ember.$.ajax({
            url: adminUrl + '/spreadsheets',
            type: 'POST',
            headers: adminHeaders,
            data: {'spreadsheet_template_id': spreadsheetTemplateId},
            dataType: 'json'
          }).done(function(data) {
            if (data.key) {
              resolve(data.key);
            } else {
              reject('No spreadsheet key returned');
            }
          }).error(function(jqXHR, textStatus, errorThrown) {
            reject({'from': 'posting to admin spreadsheets', 'jqXHR':jqXHR, 'textStatus':textStatus, 'errorThrown':errorThrown});
          });
        });
      }

      function createEmberUseCaseObject(spreadsheetKey) {
        return Iago.UseCase.create({
          name: name,
          description: description,
          icon: icon,
          spreadsheetKey: spreadsheetKey
        });
      }

      function saveUseCase(useCase) {
        return new Promise(function(resolve, reject) {
          Ember.$.post('/use_cases', useCase.getProperties('name', 'description', 'icon', 'spreadsheetKey', 'themes'), function(data) {
            controller.content.addObject(useCase);
            resolve(data);
          }).fail(function(jqXHR, textStatus, errorThrown) {
            reject({'from': 'saving new use case', 'jqXHR': jqXHR, 'textStatus': textStatus, 'errorThrown': errorThrown});
          });
        });
      }
    }
  }
});

function startLoading(tagId) {
  Ember.$('#' + tagId).append('<img class="loading-img" src="/images/loading.gif" />');
}

function endLoading(tagId) {
  Ember.$('#' + tagId + ' .loading-img').remove();
}
