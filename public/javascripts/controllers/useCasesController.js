Iago.UseCasesNewController = Ember.ObjectController.extend({
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

      getSpreadsheetTemplateId()
      .then(copySpreadsheetAndGetSpreadsheetKey)
      .then(createEmberUseCaseObject)
      .then(saveUseCase)
      .then(function(allLocalUseCases) { return console.log(allLocalUseCases); })
      .catch(function(error) {
        // TODO: properly handle the error
        console.log('ERROR:');
        console.log(error);
      });

      // The business logic
      function getSpreadsheetTemplateId() {
        return new Promise(function(resolve, reject) {
          Ember.$.ajax({
            url: 'http://' + adminUrl + '/spreadsheet_templates',
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
            url: 'http://' + adminUrl + '/spreadsheets',
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
            controller.content.localUseCases.addObject(useCase);
            resolve(data);
          }).fail(function(jqXHR, textStatus, errorThrown) {
            reject({'from': 'saving new use case', 'jqXHR': jqXHR, 'textStatus': textStatus, 'errorThrown': errorThrown});
          });
        });
      }
    }
  }
});
