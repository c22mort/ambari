/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var App = require('app');
require('controllers/main/admin/security/security_progress_controller');
require('controllers/main/admin/security/add/step4');
require('utils/polling');
require('models/cluster_states');
require('models/service');

describe('App.MainAdminSecurityAddStep4Controller', function () {

  var controller = App.MainAdminSecurityAddStep4Controller.create({
    content: {},
    enableSubmit: function () {
      this._super()
    },
    secureMapping: [],
    secureProperties: []
  });

  describe('#secureServices', function() {
    it('content.services is correct', function() {
      controller.set('content.services', [{}]);
      expect(controller.get('secureServices')).to.eql([{}]);
      controller.reopen({
        secureServices: []
      })
    });
  });

  describe('#isBackBtnDisabled', function() {
    it('commands have error', function() {
      controller.set('commands', [Em.Object.create({
        isError: true
      })]);
      expect(controller.get('isBackBtnDisabled')).to.be.false;
    });
    it('commands do not have error', function() {
      controller.set('commands', [Em.Object.create({
        isError: false
      })]);
      expect(controller.get('isBackBtnDisabled')).to.be.true;
    });
  });

  describe('#isSecurityApplied', function() {
    var testCases = [
      {
        title: 'No START_SERVICES command',
        commands: [],
        result: false
      },
      {
        title: 'START_SERVICES is not success',
        commands: [Em.Object.create({
          name: 'START_SERVICES',
          isSuccess: false
        })],
        result: false
      },
      {
        title: 'START_SERVICES is success',
        commands: [Em.Object.create({
          name: 'START_SERVICES',
          isSuccess: true
        })],
        result: true
      }
    ];

    testCases.forEach(function(test){
      it(test.title, function() {
        controller.set('commands', test.commands);
        expect(controller.get('isSecurityApplied')).to.equal(test.result);
      });
    });
  });

  describe('#enableSubmit()', function() {
    var mock = {
      setStepsEnable: Em.K,
      setLowerStepsDisable: Em.K
    };

    beforeEach(function () {
      sinon.stub(App.router, 'get', function () {
        return mock;
      });
      sinon.spy(mock, 'setStepsEnable');
      sinon.spy(mock, 'setLowerStepsDisable');
    });
    afterEach(function () {
      App.router.get.restore();
      mock.setStepsEnable.restore();
      mock.setLowerStepsDisable.restore();
    });

    it('Command has error', function() {
      controller.set('commands', [Em.Object.create({
        isError: true
      })]);
      controller.enableSubmit();
      expect(controller.get('isSubmitDisabled')).to.be.false;
      expect(mock.setStepsEnable.calledOnce).to.be.true;
    });
    it('Command is successful', function() {
      controller.set('commands', [Em.Object.create({
        isSuccess: true
      })]);
      controller.enableSubmit();
      expect(controller.get('isSubmitDisabled')).to.be.false;
    });
    it('Command is in progress', function() {
      controller.set('commands', [Em.Object.create()]);
      controller.enableSubmit();
      expect(controller.get('isSubmitDisabled')).to.be.true;
      expect(mock.setLowerStepsDisable.calledWith(4)).to.be.true;
    });
  });

  describe('#clearStep()', function() {
    it('Clear step info', function() {
      controller.set('commands', [Em.Object.create()]);
      controller.set('isSubmitDisabled', false);
      controller.set('serviceConfigTags', [{}]);
      controller.clearStep();
      expect(controller.get('isSubmitDisabled')).to.be.true;
      expect(controller.get('commands')).to.be.empty;
      expect(controller.get('serviceConfigTags')).to.be.empty;
    });
  });

  describe('#loadCommands()', function() {

    beforeEach(function () {
      controller.get('commands').clear();
    });

    it('No YARN in secureServices', function() {
      controller.set('secureServices', []);
      controller.loadCommands();
      expect(controller.get('commands.length')).to.equal(3);
      expect(controller.get('commands').someProperty('name', 'DELETE_ATS')).to.be.false;
    });
    it('YARN does not have APP_TIMELINE_SERVER', function() {
      sinon.stub(App.Service, 'find', function () {
        return Em.Object.create({
          hostComponents: []
        })
      });
      controller.set('secureServices', [{
        serviceName: 'YARN'
      }]);
      controller.loadCommands();
      expect(controller.get('commands.length')).to.equal(3);
      expect(controller.get('commands').someProperty('name', 'DELETE_ATS')).to.be.false;
      App.Service.find.restore();
    });
    it('YARN has APP_TIMELINE_SERVER', function() {
      sinon.stub(App.Service, 'find', function () {
        return Em.Object.create({
          hostComponents: [Em.Object.create({
            componentName: 'APP_TIMELINE_SERVER'
          })]
        })
      });
      controller.set('secureServices', [{
        serviceName: 'YARN'
      }]);
      controller.loadCommands();
      expect(controller.get('commands.length')).to.equal(4);
      expect(controller.get('commands').someProperty('name', 'DELETE_ATS')).to.be.true;
      App.Service.find.restore();
    });
  });

  describe('#loadStep()', function() {

    beforeEach(function () {
      sinon.stub(controller, 'clearStep', Em.K);
      sinon.stub(controller, 'prepareSecureConfigs', Em.K);
    });
    afterEach(function () {
      controller.clearStep.restore();
      controller.prepareSecureConfigs.restore();
      controller.resumeSavedCommands.restore();
    });

    it('Resume saved commands', function() {
      sinon.stub(controller, 'resumeSavedCommands', function(){
        return true;
      });

      controller.loadStep();
      expect(controller.clearStep.calledOnce).to.be.true;
      expect(controller.prepareSecureConfigs.calledOnce).to.be.true;
      expect(controller.resumeSavedCommands.calledOnce).to.be.true;
    });
    it('No saved commands', function() {
      sinon.stub(controller, 'resumeSavedCommands', function(){
        return false;
      });
      sinon.stub(controller, 'loadCommands', Em.K);
      sinon.stub(controller, 'addInfoToCommands', Em.K);
      sinon.stub(controller, 'syncStopServicesOperation', Em.K);
      sinon.stub(controller, 'addObserverToCommands', Em.K);
      sinon.stub(controller, 'moveToNextCommand', Em.K);

      controller.loadStep();
      expect(controller.clearStep.calledOnce).to.be.true;
      expect(controller.prepareSecureConfigs.calledOnce).to.be.true;
      expect(controller.resumeSavedCommands.calledOnce).to.be.true;

      controller.loadCommands.restore();
      controller.addInfoToCommands.restore();
      controller.syncStopServicesOperation.restore();
      controller.addObserverToCommands.restore();
      controller.moveToNextCommand.restore();
    });
  });

  describe('#syncStopServicesOperation()', function() {

    afterEach(function () {
      App.router.get.restore();
    });

    it('No running operations', function() {
      sinon.stub(App.router, 'get', function(){
        return [];
      });

      expect(controller.syncStopServicesOperation()).to.be.false;
    });
    it('Running operation is not Stop All Services', function() {
      sinon.stub(App.router, 'get', function(){
        return [Em.Object.create({isRunning: true})];
      });

      expect(controller.syncStopServicesOperation()).to.be.false;
    });
    it('No STOP_SERVICES in commands', function() {
      sinon.stub(App.router, 'get', function(){
        return [Em.Object.create({
          isRunning: true,
          name: 'Stop All Services'
        })];
      });
      controller.set('commands', []);

      expect(controller.syncStopServicesOperation()).to.be.false;
    });
    it('Sync stop services commands', function() {
      sinon.stub(App.router, 'get', function(){
        return [Em.Object.create({
          isRunning: true,
          name: 'Stop All Services',
          id: 1
        })];
      });
      controller.set('commands', [Em.Object.create({
        name: 'STOP_SERVICES'
      })]);

      expect(controller.syncStopServicesOperation()).to.be.true;
      expect(controller.get('commands').findProperty('name', 'STOP_SERVICES').get('requestId')).to.equal(1);
    });
  });

  describe('#resumeSavedCommands()', function() {

    beforeEach(function(){
      sinon.stub(controller, 'addObserverToCommands', Em.K);
      sinon.stub(controller, 'moveToNextCommand', Em.K);
      controller.set('commands', []);
    });
    afterEach(function(){
      controller.moveToNextCommand.restore();
      controller.addObserverToCommands.restore();
      App.db.getSecurityDeployCommands.restore();
    });


    it('Commands is null', function() {
      sinon.stub(App.db, 'getSecurityDeployCommands', function(){
        return null;
      });
      expect(controller.resumeSavedCommands()).to.be.false;
    });
    it('Commands is empty', function() {
      sinon.stub(App.db, 'getSecurityDeployCommands', function(){
        return [];
      });
      expect(controller.resumeSavedCommands()).to.be.false;
    });
    it('Command has error', function() {
      sinon.stub(App.db, 'getSecurityDeployCommands', function(){
        return [{
          isError: true,
          name: 'command1'
        }];
      });
      expect(controller.resumeSavedCommands()).to.be.true;
      expect(controller.get('commands').mapProperty('name')).to.eql(['command1']);
      expect(controller.addObserverToCommands.calledOnce).to.be.true;
    });
    it('Command in progress', function() {
      sinon.stub(App.db, 'getSecurityDeployCommands', function(){
        return [{
          isStarted: true,
          isCompleted: false,
          name: 'command1'
        }];
      });
      expect(controller.resumeSavedCommands()).to.be.true;
      expect(controller.get('commands').mapProperty('name')).to.eql(['command1']);
      expect(controller.get('commands').findProperty('name', 'command1').get('isStarted')).to.be.false;
      expect(controller.addObserverToCommands.calledOnce).to.be.true;
      expect(controller.moveToNextCommand.calledOnce).to.be.true;
    });
    it('Command completed', function() {
      sinon.stub(App.db, 'getSecurityDeployCommands', function(){
        return [{
          isCompleted: true,
          name: 'command1'
        }];
      });
      expect(controller.resumeSavedCommands()).to.be.true;
      expect(controller.get('commands').mapProperty('name')).to.eql(['command1']);
      expect(controller.addObserverToCommands.calledOnce).to.be.true;
      expect(controller.moveToNextCommand.calledOnce).to.be.true;
    });
  });

  describe('#loadUiSideConfigs()', function() {

    beforeEach(function(){
      sinon.stub(controller, 'getGlobConfigValue', function(arg1, arg2){
        return arg2;
      });
      sinon.stub(controller, 'checkServiceForConfigValue', function() {
        return 'value2';
      });
      sinon.stub(controller, 'setConfigValue', Em.K);
      sinon.stub(controller, 'formatConfigName', Em.K);
    });
    afterEach(function(){
      controller.getGlobConfigValue.restore();
      controller.checkServiceForConfigValue.restore();
      controller.setConfigValue.restore();
      controller.formatConfigName.restore();
    });

    it('secureMapping is empty', function() {
      controller.set('secureMapping', []);

      expect(controller.loadUiSideConfigs()).to.be.empty;
    });
    it('Config does not have dependedServiceName', function() {
      controller.set('secureMapping', [{
        name: 'config1',
        value: 'value1',
        filename: 'file1',
        foreignKey: null
      }]);

      expect(controller.loadUiSideConfigs()).to.eql([{
        "id": "site property",
        "name": 'config1',
        "value": 'value1',
        "filename": 'file1'
      }]);
    });
    it('Config has dependedServiceName', function() {
      controller.set('secureMapping', [{
        name: 'config1',
        value: 'value1',
        filename: 'file1',
        foreignKey: null,
        dependedServiceName: 'service'
      }]);

      expect(controller.loadUiSideConfigs()).to.eql([{
        "id": "site property",
        "name": 'config1',
        "value": 'value2',
        "filename": 'file1'
      }]);
    });
    it('Config has non-existent serviceName', function() {
      controller.set('secureMapping', [{
        name: 'config1',
        value: 'value1',
        filename: 'file1',
        foreignKey: true,
        serviceName: 'service'
      }]);
      sinon.stub(App.Service, 'find', function(){
        return [];
      });

      expect(controller.loadUiSideConfigs()).to.be.empty;
      App.Service.find.restore();
    });
    it('Config has correct serviceName', function() {
      controller.set('secureMapping', [{
        name: 'config1',
        value: 'value1',
        filename: 'file1',
        foreignKey: true,
        serviceName: 'HDFS'
      }]);
      sinon.stub(App.Service, 'find', function(){
        return [{serviceName: 'HDFS'}];
      });

      expect(controller.loadUiSideConfigs()).to.eql([{
        "id": "site property",
        "name": 'config1',
        "value": 'value1',
        "filename": 'file1'
      }]);
      expect(controller.setConfigValue.calledOnce).to.be.true;
      expect(controller.formatConfigName.calledOnce).to.be.true;
      App.Service.find.restore();
    });
  });

  describe('#checkServiceForConfigValue()', function() {
    it('services is empty', function() {
      var services = [];

      expect(controller.checkServiceForConfigValue('value1', services)).to.equal('value1');
    });
    it('Service is loaded', function() {
      var services = [{}];
      sinon.stub(App.Service, 'find', function () {
        return Em.Object.create({isLoaded: false});
      });

      expect(controller.checkServiceForConfigValue('value1', services)).to.equal('value1');

      App.Service.find.restore();
    });
    it('Service is not loaded', function() {
      var services = [{
        replace: 'val'
      }];
      sinon.stub(App.Service, 'find', function () {
        return Em.Object.create({isLoaded: false});
      });

      expect(controller.checkServiceForConfigValue('value1', services)).to.equal('ue1');

      App.Service.find.restore();
    });
  });

  describe('#getGlobConfigValue()', function() {
    var testCases = [
      {
        title: 'Incorrect expression',
        arguments: {
          templateName: [],
          expression: 'expression'
        },
        result: 'expression'
      },
      {
        title: 'No such property in global configs',
        arguments: {
          templateName: ['config2'],
          expression: '<[0]>'
        },
        result: null
      },
      {
        title: 'Property in global configs',
        arguments: {
          templateName: ['config1'],
          expression: '<[0]>'
        },
        result: 'value1'
      },
      {
        title: 'First property not in global configs',
        arguments: {
          templateName: ['config2','config1'],
          expression: '<[0]>@<[1]>'
        },
        result: null
      }
    ];

    testCases.forEach(function(test){
      it(test.title, function() {
        controller.set('globalProperties', [{
          name: 'config1',
          value: 'value1'
        }]);
        expect(controller.getGlobConfigValue(test.arguments.templateName, test.arguments.expression)).to.equal(test.result);
      });
    });
  });

  describe('#formatConfigName()', function() {
    it('config.value is null', function() {
      var config = {
        value: null
      };

      expect(controller.formatConfigName([], config)).to.be.false;
    });
    it('config.name does not contain foreignKey', function() {
      var config = {
        value: 'value1',
        name: 'config1'
      };

      expect(controller.formatConfigName([], config)).to.be.false;
    });
    it('globalProperties is empty, use uiConfig', function() {
      var config = {
        value: 'value1',
        name: '<foreignKey[0]>',
        foreignKey: ['key1']
      };
      controller.set('globalProperties', []);
      var uiConfig = [{
        name: 'key1',
        value: 'globalValue1'
      }];

      expect(controller.formatConfigName(uiConfig, config)).to.be.true;
      expect(config._name).to.equal('globalValue1');
    });
    it('uiConfig is empty, use globalProperties', function() {
      var config = {
        value: 'value1',
        name: '<foreignKey[0]>',
        foreignKey: ['key1']
      };
      controller.set('globalProperties', [{
        name: 'key1',
        value: 'globalValue1'
      }]);
      var uiConfig = [];

      expect(controller.formatConfigName(uiConfig, config)).to.be.true;
      expect(config._name).to.equal('globalValue1');
    });
  });

  describe('#setConfigValue()', function() {
    it('config.value is null', function() {
      var config = {
        value: null
      };

      expect(controller.setConfigValue(config)).to.be.false;
    });
    it('config.value does not match "templateName"', function() {
      var config = {
        value: ''
      };

      expect(controller.setConfigValue(config)).to.be.false;
    });
    it('No such property in global configs', function() {
      var config = {
        value: '<templateName[0]>',
        templateName: ['config1']
      };
      controller.set('globalProperties', []);

      expect(controller.setConfigValue(config)).to.be.true;
      expect(config.value).to.be.null;
    });
    it('Property in global configs', function() {
      var config = {
        value: '<templateName[0]>',
        templateName: ['config1']
      };
      controller.set('globalProperties', [{
        name: 'config1',
        value: 'value1'
      }]);

      expect(controller.setConfigValue(config)).to.be.true;
      expect(config.value).to.equal('value1');
    });
  });

  describe('#prepareSecureConfigs()', function() {

    beforeEach(function(){
      sinon.stub(controller, 'loadGlobals', Em.K);
      sinon.stub(controller, 'loadUiSideConfigs', function(){
        return [{name: 'config1'}];
      });
    });
    afterEach(function(){
      controller.loadGlobals.restore();
      controller.loadUiSideConfigs.restore();
    });

    it('content.serviceConfigProperties is empty', function() {
      controller.set('content.serviceConfigProperties', []);

      controller.prepareSecureConfigs();
      expect(controller.loadGlobals.calledOnce).to.be.true;
      expect(controller.loadUiSideConfigs.calledOnce).to.be.true;
      expect(controller.get('configs')).to.eql([{name: 'config1'}]);
    });
    it('content.serviceConfigProperties is empty', function() {
      controller.set('content.serviceConfigProperties', [{
        id: 'site property',
        name: 'config2'
      }]);

      controller.prepareSecureConfigs();
      expect(controller.loadGlobals.calledOnce).to.be.true;
      expect(controller.loadUiSideConfigs.calledOnce).to.be.true;
      expect(controller.get('configs')).to.eql([
        {
          id: 'site property',
          name: 'config2'
        },
        {name: 'config1'}
      ]);
    });
  });

  describe('#loadGlobals()', function() {

    beforeEach(function(){
      sinon.stub(controller, 'loadStaticGlobal', Em.K);
      sinon.stub(controller, 'loadUsersToGlobal', Em.K);
      sinon.stub(controller, 'loadHostNamesToGlobal', Em.K);
      sinon.stub(controller, 'loadPrimaryNamesToGlobals', Em.K);
    });
    afterEach(function(){
      controller.loadStaticGlobal.restore();
      controller.loadUsersToGlobal.restore();
      controller.loadHostNamesToGlobal.restore();
      controller.loadPrimaryNamesToGlobals.restore();
    });

    it('content.serviceConfigProperties is empty', function() {
      controller.set('content.serviceConfigProperties', []);

      controller.loadGlobals();
      expect(controller.loadStaticGlobal.calledOnce).to.be.true;
      expect(controller.loadUsersToGlobal.calledOnce).to.be.true;
      expect(controller.loadHostNamesToGlobal.calledOnce).to.be.true;
      expect(controller.loadPrimaryNamesToGlobals.calledOnce).to.be.true;
      expect(controller.get('globalProperties')).to.be.empty;
    });
    it('content.serviceConfigProperties is correct', function() {
      controller.set('content.serviceConfigProperties', [{
        id: 'puppet var',
        name: 'config1'
      }]);

      controller.loadGlobals();
      expect(controller.loadStaticGlobal.calledOnce).to.be.true;
      expect(controller.loadUsersToGlobal.calledOnce).to.be.true;
      expect(controller.loadHostNamesToGlobal.calledOnce).to.be.true;
      expect(controller.loadPrimaryNamesToGlobals.calledOnce).to.be.true;
      expect(controller.get('globalProperties')).to.eql([{
        id: 'puppet var',
        name: 'config1'
      }]);
    });
  });

  describe('#loadUsersToGlobal()', function() {

    beforeEach(function(){
      sinon.stub(controller, 'loadUsersFromServer', Em.K);
    });
    afterEach(function(){
      controller.loadUsersFromServer.restore();
      App.router.get.restore();
    });

    it('serviceUsers is empty', function() {
      sinon.stub(App.router, 'get', function(){
        return [];
      });
      controller.set('serviceUsers', []);
      controller.set('globalProperties', []);

      controller.loadUsersToGlobal();
      expect(controller.loadUsersFromServer.calledOnce).to.be.true;
      expect(controller.get('globalProperties')).to.be.empty;
    });
    it('serviceUsers is correct', function() {
      sinon.stub(App.router, 'get', function(){
        return [{name: 'user1'}];
      });
      controller.set('serviceUsers', [{}]);
      controller.set('globalProperties', []);

      controller.loadUsersToGlobal();
      expect(controller.loadUsersFromServer.called).to.be.false;
      expect(controller.get('globalProperties').mapProperty('name')).to.eql(['user1']);
    });
  });

  describe('#addHostConfig()', function() {

    afterEach(function () {
      App.Service.find.restore();
    });

    it('No such service loaded', function() {
      sinon.stub(App.Service, 'find', function(){
        return Em.Object.create({isLoaded: false});
      });

      expect(controller.addHostConfig('service1', 'comp1', 'config1')).to.be.false;
    });
    it('No such service in secureServices', function() {
      sinon.stub(App.Service, 'find', function(){
        return Em.Object.create({isLoaded: true});
      });
      controller.set('secureServices', []);

      expect(controller.addHostConfig('service1', 'comp1', 'config1')).to.be.false;
    });
    it('Service does not have such host-component', function() {
      sinon.stub(App.Service, 'find', function(){
        return Em.Object.create({
          isLoaded: true,
          hostComponents: []
        });
      });
      controller.set('secureServices', [{
        serviceName: 'service1'
      }]);

      expect(controller.addHostConfig('service1', 'comp1', 'config1')).to.be.false;
    });
    it('Push config to globalProperties', function() {
      sinon.stub(App.Service, 'find', function(){
        return Em.Object.create({
          isLoaded: true,
          hostComponents: [Em.Object.create({
            componentName: 'comp1',
            host: {hostName: 'host1'}
          })]
        });
      });
      controller.set('secureServices', [{
        serviceName: 'service1'
      }]);

      controller.set('globalProperties', []);

      expect(controller.addHostConfig('service1', 'comp1', 'config1')).to.be.true;
      expect(controller.get('globalProperties')).to.eql([{
        id: 'puppet var',
        name: 'config1',
        value: 'host1'
      }]);
    });
  });

  describe('#loadHostNamesToGlobal()', function() {

    beforeEach(function () {
      sinon.stub(controller, 'addHostConfig', Em.K);
    });
    afterEach(function () {
      controller.addHostConfig.restore();
    });

    it('componentsConfig is empty', function() {
      controller.set('componentsConfig', []);

      controller.loadHostNamesToGlobal();
      expect(controller.addHostConfig.called).to.be.false;
    });
    it('componentsConfig is correct', function() {
      controller.set('componentsConfig', [{
        serviceName: 'service1',
        componentName: 'comp1',
        configName: 'config1'
      }]);

      controller.loadHostNamesToGlobal();
      expect(controller.addHostConfig.calledWith('service1', 'comp1', 'config1')).to.be.true;
    });
  });

  describe('#loadStaticGlobal()', function() {
    it('globalProperties contains "security_enabled" property', function() {
      controller.set('globalProperties', [{
        name: 'security_enabled'
      }]);

      controller.loadStaticGlobal();
      expect(controller.get('globalProperties').findProperty('name', 'security_enabled').value).to.equal('true');
    });
  });

  describe('#loadPrimaryNamesToGlobals()', function() {

    beforeEach(function(){
      controller.set('globalProperties', []);
    });
    afterEach(function () {
      controller.getPrincipalNames.restore();
    });

    it('No principal names', function() {
      sinon.stub(controller, 'getPrincipalNames', function(){
        return [];
      });

      controller.loadPrimaryNamesToGlobals();
      expect(controller.get('globalProperties')).to.be.empty;
    });
    it('Principal name does not contain "principal"', function() {
      sinon.stub(controller, 'getPrincipalNames', function(){
        return [{
          name: 'config1',
          value: 'value2/value1'
        }];
      });

      controller.loadPrimaryNamesToGlobals();
      expect(controller.get('globalProperties')).to.eql([{name: 'config1', value: 'value2'}]);
    });
    it('Principal name contains "principal"', function() {
      sinon.stub(controller, 'getPrincipalNames', function(){
        return [{
          name: 'principal1',
          value: 'value1'
        }];
      });

      controller.loadPrimaryNamesToGlobals();
      expect(controller.get('globalProperties')).to.eql([{name: 'primary1', value: 'value1'}]);
    });
  });

  describe('#getPrincipalNames()', function() {

    beforeEach(function () {
      controller.set('globalProperties', []);
      controller.set('secureProperties', []);
    });

    it('globalProperties and secureProperties are empty', function() {
      expect(controller.getPrincipalNames()).to.be.empty;
    });
    it('global property name does not match "principal_name"', function() {
      controller.set('globalProperties', [{
        name: 'config1'
      }]);
      expect(controller.getPrincipalNames()).to.be.empty;
    });
    it('secure property name does not match "principal_name"', function() {
      controller.set('secureProperties', [{
        name: 'config1'
      }]);
      expect(controller.getPrincipalNames()).to.be.empty;
    });
    it('global property name matches "principal_name"', function() {
      controller.set('globalProperties', [{
        name: 'principal_name'
      }]);
      expect(controller.getPrincipalNames()).to.eql([{
        name: 'principal_name'
      }]);
    });
    it('property with such name already exists', function() {
      controller.set('globalProperties', [{
        name: 'principal_name'
      }]);
      controller.set('secureProperties', [{
        name: 'principal_name'
      }]);
      expect(controller.getPrincipalNames().mapProperty('name')).to.eql(['principal_name']);
    });
    it('global and secure property name matches "principal_name"', function() {
      controller.set('globalProperties', [{
        name: 'global_principal_name'
      }]);
      controller.set('secureProperties', [{
        name: 'secure_principal_name',
        defaultValue: 'value1'
      }]);
      expect(controller.getPrincipalNames().mapProperty('name')).to.eql(['global_principal_name', 'secure_principal_name']);
      expect(controller.getPrincipalNames().findProperty('name', 'secure_principal_name').value).to.equal('value1');
    });
  });

  describe('#loadUsersFromServer()', function() {
    it('testMode = true', function() {
      controller.set('testModeUsers', [{
        name: 'user1',
        value: 'value1'
      }]);
      controller.set('serviceUsers', []);
      App.testMode = true;

      controller.loadUsersFromServer();
      expect(controller.get('serviceUsers')).to.eql([{
        name: 'user1',
        value: 'value1',
        id: 'puppet var'
      }]);
    });
    it('testMode = false', function() {
      sinon.stub(App.router, 'set', Em.K);
      sinon.stub(App.db, 'getSecureUserInfo', function(){
        return [];
      });
      App.testMode = false;

      controller.loadUsersFromServer();
      expect(App.db.getSecureUserInfo.calledOnce).to.be.true;
      expect(App.router.set.calledWith('mainAdminSecurityController.serviceUsers', [])).to.be.true;

      App.router.set.restore();
      App.db.getSecureUserInfo.restore();
    });
  });

  describe('#manageSecureConfigs()', function() {

    beforeEach(function () {
      sinon.stub(controller, 'setPrincipalValue', Em.K);
    });
    afterEach(function () {
      controller.setPrincipalValue.restore();
    });

    it('serviceConfigTags is null', function() {
      sinon.stub(controller, 'onJsError', Em.K);
      controller.set('serviceConfigTags', null);
      controller.set('configs', [{id: 'site property'}]);
      controller.set('commands', [Em.Object.create({
        name: 'APPLY_CONFIGURATIONS'
      })]);

      expect(controller.manageSecureConfigs()).to.be.false;
      expect(controller.onJsError.calledOnce).to.be.true;
      expect(controller.get('commands').findProperty('name', 'APPLY_CONFIGURATIONS').get('isSuccess')).to.be.false;
      expect(controller.get('commands').findProperty('name', 'APPLY_CONFIGURATIONS').get('isError')).to.be.true;

      controller.onJsError.restore();
    });
    it('Add configs from site-*.xml', function() {
      controller.set('serviceConfigTags', [{
        siteName: 'site1',
        configs: {}
      }]);
      controller.set('configs', [{
        id: 'site property',
        name: 'config1',
        value: "value1",
        filename: 'site1.xml'
      }]);

      expect(controller.manageSecureConfigs()).to.be.true;
      expect(controller.get('serviceConfigTags')[0].configs).to.eql({'config1': 'value1'});
    });
    it('Add configs from global.xml, config matches "_hosts"', function() {
      controller.set('serviceConfigTags', [{
        siteName: 'global',
        configs: {}
      }]);
      controller.set('globalProperties', [{
        id: 'site property',
        name: 'config1_hosts',
        value: "value1",
        filename: 'site1.xml'
      }]);
      controller.set('secureConfigs', [{
        serviceName: 'service1',
        name: 'config1'
      }]);

      expect(controller.manageSecureConfigs()).to.be.true;
      expect(controller.get('serviceConfigTags')[0].configs).to.eql({});
      expect(controller.setPrincipalValue.calledWith('service1', 'config1')).to.be.true;
    });
    it('Add configs from global.xml, config does not match "_hosts"', function() {
      controller.set('serviceConfigTags', [{
        siteName: 'global',
        configs: {}
      }]);
      controller.set('globalProperties', [{
        id: 'site property',
        name: 'config1',
        value: "value1",
        filename: 'site1.xml'
      }]);
      controller.set('secureConfigs', [{
        serviceName: 'service1',
        name: 'config1'
      }]);

      expect(controller.manageSecureConfigs()).to.be.true;
      expect(controller.get('serviceConfigTags')[0].configs).to.eql({'config1': 'value1'});
      expect(controller.setPrincipalValue.calledWith('service1', 'config1')).to.be.true;
    });
  });

  describe('#setPrincipalValue()', function() {
    it('secureServices does not contain such service', function() {
      controller.set('secureServices', []);

      expect(controller.setPrincipalValue('service1', 'principal1')).to.be.false;
    });
    it('secureServices contains such service', function() {
      controller.set('secureServices', [{
        serviceName: 'service1'
      }]);
      controller.set('globalProperties', [
        {
          name: 'kerberos_domain',
          value: 'value1'
        },
        {
          name: 'principal1',
          value: 'value2'
        }
      ]);

      expect(controller.setPrincipalValue('service1', 'principal1')).to.be.true;
      expect(controller.get('globalProperties').findProperty('name', 'principal1').value).to.equal('value2@value1');
    });
  });

  describe('#deleteComponents()', function() {
    it('Send ajax', function() {
      sinon.stub(App.ajax, 'send', Em.K);

      controller.deleteComponents('comp1', 'host1');
      expect(App.ajax.send.calledOnce).to.be.true;

      App.ajax.send.restore();
    });
  });

  describe('#onDeleteComplete()', function() {
    it('', function() {
      controller.set('commands', [Em.Object.create({
        name: 'DELETE_ATS'
      })]);

      controller.onDeleteComplete();
      expect(controller.get('commands').findProperty('name', 'DELETE_ATS').get('isError')).to.be.false;
      expect(controller.get('commands').findProperty('name', 'DELETE_ATS').get('isSuccess')).to.be.true;
    });
  });

  describe('#onJsError()', function() {
    it('Show popup', function() {
      sinon.stub(App.ModalPopup, 'show', Em.K);

      controller.onJsError();
      expect(App.ModalPopup.show.calledOnce).to.be.true;

      App.ModalPopup.show.restore();
    });
  });
});
