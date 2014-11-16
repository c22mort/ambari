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
var numberUtils = require('utils/number_utils');

App.WizardStep5Controller = Em.Controller.extend({

  name: "wizardStep5Controller",

  /**
   * Step title
   * Custom if <code>App.ReassignMasterController</code> is used
   * @type {string}
   */
  title: function () {
    if (this.get('content.controllerName') == 'reassignMasterController') {
      return Em.I18n.t('installer.step5.reassign.header');
    }
    return Em.I18n.t('installer.step5.header');
  }.property('content.controllerName'),

  /**
   * Is ReassignWizard used
   * @type {bool}
   */
  isReassignWizard: function () {
    return this.get('content.controllerName') == 'reassignMasterController';
  }.property('content.controllerName'),

  /**
   * Is AddServiceWizard used
   * @type {bool}
   */
  isAddServiceWizard: function () {
    return this.get('content.controllerName') == 'addServiceController';
  }.property('content.controllerName'),

  /**
   * Is Hive reassigning
   * @type {bool}
   */
  isReassignHive: function () {
    return this.get('servicesMasters').objectAt(0) && this.get('servicesMasters').objectAt(0).component_name == 'HIVE_SERVER' && this.get('isReassignWizard');
  }.property('isReassignWizard', 'servicesMasters'),

  /**
   * Master components which could be assigned to multiple hosts
   * @type {string[]}
   */
  multipleComponents: ['ZOOKEEPER_SERVER', 'HBASE_MASTER'],

  /**
   * Define state for submit button
   * @type {bool}
   */
  submitDisabled: false,

  /**
   * Trigger for executing host names check for components
   * Should de "triggered" when host changed for some component and when new multiple component is added/removed
   * @type {bool}
   */
  hostNameCheckTrigger: false,

  /**
   * List of hosts
   * @type {Array}
   */
  hosts: [],

  /**
   * Name of multiple component which host name was changed last
   * @type {Object|null}
   */
  componentToRebalance: null,

  /**
   * Name of component which host was changed last
   * @type {string}
   */
  lastChangedComponent: null,

  /**
   * Flag for rebalance multiple components
   * @type {number}
   */
  rebalanceComponentHostsCounter: 0,

  /**
   * @type {Ember.Enumerable}
   */
  servicesMasters: [],

  /**
   * @type {Ember.Enumerable}
   */
  selectedServicesMasters: [],

  /**
   * Is data for current step loaded
   * @type {bool}
   */
  isLoaded: false,

  /**
   * Check if HIVE_SERVER component exist (also checks if this is not reassign)
   * @type {bool}
   */
  hasHiveServer: function () {
    return this.get('selectedServicesMasters').someProperty('component_name', 'HIVE_SERVER') && !this.get('isReassignWizard');
  }.property('selectedServicesMasters'),

  /**
   * List of host with assigned masters
   * Format:
   * <code>
   *   [
   *     {
   *       host_name: '',
   *       hostInfo: {},
   *       masterServices: [],
   *       masterServicesToDisplay: [] // used only in template
   *    },
   *    ....
   *   ]
   * </code>
   * @type {Ember.Enumerable}
   */
  masterHostMapping: function () {
    var mapping = [], mappingObject, mappedHosts, hostObj;
    //get the unique assigned hosts and find the master services assigned to them
    mappedHosts = this.get("selectedServicesMasters").mapProperty("selectedHost").uniq();
    mappedHosts.forEach(function (item) {
      hostObj = this.get("hosts").findProperty("host_name", item);
      // User may input invalid host name (this is handled in hostname checker). Here we just skip it
      if (!hostObj) return;
      var masterServices = this.get("selectedServicesMasters").filterProperty("selectedHost", item),
        masterServicesToDisplay = [];
      masterServices.mapProperty('display_name').uniq().forEach(function (n) {
        masterServicesToDisplay.pushObject(masterServices.findProperty('display_name', n));
      });
      mappingObject = Em.Object.create({
        host_name: item,
        hostInfo: hostObj.host_info,
        masterServices: masterServices,
        masterServicesToDisplay: masterServicesToDisplay
      });

      mapping.pushObject(mappingObject);
    }, this);

    return mapping.sortProperty('host_name');
  }.property("selectedServicesMasters.@each.selectedHost", 'selectedServicesMasters.@each.isHostNameValid'),

  /**
   * Count of hosts without masters
   * @type {number}
   */
  remainingHosts: function () {
    if (this.get('content.controllerName') === 'installerController') {
      return 0;
    } else {
      return (this.get("hosts.length") - this.get("masterHostMapping.length"));
    }
  }.property('masterHostMapping.length', 'selectedServicesMasters.@each.selectedHost'),

  /**
   * Update submit button status
   * @metohd getIsSubmitDisabled
   */
  getIsSubmitDisabled: function () {
    var isSubmitDisabled = this.get('servicesMasters').someProperty('isHostNameValid', false);
    this.set('submitDisabled', isSubmitDisabled);
    return isSubmitDisabled;
  }.observes('servicesMasters.@each.selectedHost', 'servicesMasters.@each.isHostNameValid'),

  /**
   * Clear controller data (hosts, masters etc)
   * @method clearStep
   */
  clearStep: function () {
    this.set('hosts', []);
    this.set('selectedServicesMasters', []);
    this.set('servicesMasters', []);
  },

  /**
   * Load controller data (hosts, host components etc)
   * @method loadStep
   */
  loadStep: function () {
    console.log("WizardStep5Controller: Loading step5: Assign Masters");
    this.clearStep();
    this.renderHostInfo();
    this.renderComponents(this.loadComponents());

    this.updateComponent('ZOOKEEPER_SERVER');
    if (App.supports.multipleHBaseMasters) {
      this.updateComponent('HBASE_MASTER');
    }

    if (!this.get("selectedServicesMasters").filterProperty('isInstalled', false).length) {
      console.log('no master components to add');
      App.router.send('next');
    }
  },

  /**
   * Used to set showAddControl flag for ZOOKEEPER_SERVER and HBASE_SERVER
   * @method updateComponent
   */
  updateComponent: function (componentName) {
    var component = this.last(componentName);
    if (!component) {
      return;
    }
    var services = this.get('content.services').filterProperty('isInstalled', true).mapProperty('serviceName');
    var currentService = componentName.split('_')[0];
    var showControl = !services.contains(currentService);

    if (showControl) {
      if (this.get("selectedServicesMasters").filterProperty("component_name", componentName).length < this.get("hosts.length") && !this.get('isReassignWizard')) {
        component.set('showAddControl', true);
      } else {
        component.set('showRemoveControl', false);
      }
    }
  },

  /**
   * Load active host list to <code>hosts</code> variable
   * @method renderHostInfo
   */
  renderHostInfo: function () {
    var hostInfo = this.get('content.hosts');
    var result = [];

    for (var index in hostInfo) {
      var _host = hostInfo[index];
      if (_host.bootStatus === 'REGISTERED') {
        result.push(Em.Object.create({
          host_name: _host.name,
          cpu: _host.cpu,
          memory: _host.memory,
          disk_info: _host.disk_info,
          host_info: Em.I18n.t('installer.step5.hostInfo').fmt(_host.name, numberUtils.bytesToSize(_host.memory, 1, 'parseFloat', 1024), _host.cpu)
        }));
      }
    }
    this.set("hosts", result);
    this.sortHosts(this.get('hosts'));
    this.set('isLoaded', true);
  },

  /**
   * Sort list of host-objects by properties (memory - desc, cpu - desc, hostname - asc)
   * @param {object[]} hosts
   */
  sortHosts: function (hosts) {
    hosts.sort(function (a, b) {
      if (a.get('memory') == b.get('memory')) {
        if (a.get('cpu') == b.get('cpu')) {
          return a.get('host_name').localeCompare(b.get('host_name')); // hostname asc
        }
        return b.get('cpu') - a.get('cpu'); // cores desc
      }
      return b.get('memory') - a.get('memory'); // ram desc
    });
  },

  /**
   * Load services info to appropriate variable and return masterComponentHosts
   * @return {Object[]}
   */
  loadComponents: function () {

    var services = this.get('content.services').filterProperty('isSelected', true).mapProperty('serviceName'); //list of shown services
    var selectedServices = this.get('content.services').filterProperty('isSelected').filterProperty('isInstalled', false).mapProperty('serviceName');

    var masterComponents = App.StackServiceComponent.find().filterProperty('isShownOnInstallerAssignMasterPage', true); //get full list from mock data
    var masterHosts = this.get('content.masterComponentHosts'); //saved to local storage info

    var resultComponents = [];

    for (var index = 0; index < services.length; index++) {
      var componentInfo = masterComponents.filterProperty('serviceName', services[index]);
      // If service is already installed and not being added as a new service then render on UI only those master components
      // that have already installed hostComponents.
      // NOTE: On upgrade there might be a prior installed service with non-installed newly introduced serviceComponent
      var isNotSelectedService = !selectedServices.contains(services[index]);
      if (isNotSelectedService) {
        componentInfo = componentInfo.filter(function (_component) {
          return App.HostComponent.find().someProperty('componentName',_component.get('componentName'));
        });
      }

      componentInfo.forEach(function (_componentInfo) {
        if (_componentInfo.get('componentName') == 'ZOOKEEPER_SERVER' || _componentInfo.get('componentName') == 'HBASE_MASTER') {
          var savedComponents = masterHosts.filterProperty('component', _componentInfo.get('componentName'));
          if (savedComponents.length) {
            savedComponents.forEach(function (item) {
              var multipleMasterHost = {};
              multipleMasterHost.display_name = _componentInfo.get('displayName');
              multipleMasterHost.component_name = _componentInfo.get('componentName');
              multipleMasterHost.selectedHost = item.hostName;
              multipleMasterHost.serviceId = services[index];
              multipleMasterHost.isInstalled = item.isInstalled;
              multipleMasterHost.isHiveCoHost = false;
              resultComponents.push(multipleMasterHost);
            })
          } else {
            var zooHosts = this.selectHost(_componentInfo.get('componentName'));
            zooHosts.forEach(function (_host) {
              var multipleMasterHost = {};
              multipleMasterHost.display_name = _componentInfo.get('displayName');
              multipleMasterHost.component_name = _componentInfo.get('componentName');
              multipleMasterHost.selectedHost = _host;
              multipleMasterHost.serviceId = services[index];
              multipleMasterHost.isInstalled = false;
              multipleMasterHost.isHiveCoHost = false;
              resultComponents.push(multipleMasterHost);
            });

          }
        } else {
          var savedComponent = masterHosts.findProperty('component', _componentInfo.get('componentName'));
          var componentObj = {};
          componentObj.component_name = _componentInfo.get('componentName');
          componentObj.display_name = _componentInfo.get('displayName');
          componentObj.selectedHost = savedComponent ? savedComponent.hostName : this.selectHost(_componentInfo.get('componentName'));   // call the method that plays selectNode algorithm or fetches from server
          componentObj.isInstalled = savedComponent ? savedComponent.isInstalled : false;
          componentObj.serviceId = services[index];
          componentObj.isHiveCoHost = this._isHiveCoHost(_componentInfo.get('componentName'));
          resultComponents.push(componentObj);
        }
      }, this);
    }

    return resultComponents;
  },

  /**
   * @param {string} componentName
   * @returns {bool}
   * @private
   * @method _isHiveCoHost
   */
  _isHiveCoHost: function (componentName) {
    return ['HIVE_METASTORE', 'WEBHCAT_SERVER'].contains(componentName) && !this.get('isReassignWizard');
  },

  /**
   * Put master components to <code>selectedServicesMasters</code>, which will be automatically rendered in template
   * @param {Ember.Enumerable} masterComponents
   * @method renderComponents
   */
  renderComponents: function (masterComponents) {
    var services = this.get('content.services').filterProperty('isInstalled', true).mapProperty('serviceName'); //list of shown services
    var showRemoveControlZk = !services.contains('ZOOKEEPER') && masterComponents.filterProperty('component_name', 'ZOOKEEPER_SERVER').length > 1;
    var showRemoveControlHb = !services.contains('HBASE') && masterComponents.filterProperty('component_name', 'HBASE_MASTER').length > 1;
    var zid = 1, hid = 1, nid = 1, result = [], self = this;

    masterComponents.forEach(function (item) {

      if (item.component_name == 'SECONDARY_NAMENODE') {
        if (self.get('isAddServiceWizard')) {
          if (App.get('isHaEnabled')) {
            return;
          }
        }
      }

      var componentObj = Em.Object.create(item);
      console.log("TRACE: render master component name is: " + item.component_name);

      if (item.component_name === "ZOOKEEPER_SERVER") {
        componentObj.set('zId', zid++);
        componentObj.set("showRemoveControl", showRemoveControlZk);
      }
      else {
        if (App.get('supports.multipleHBaseMasters') && item.component_name === "HBASE_MASTER") {
          componentObj.set('zId', hid++);
          componentObj.set("showRemoveControl", showRemoveControlHb);
        }
        else {
          if (item.component_name === "NAMENODE") {
            componentObj.set('zId', nid++);
          }
        }
      }
      componentObj.set('isHostNameValid', true);
      result.push(componentObj);
    }, this);

    this.set("selectedServicesMasters", result);
    if (this.get('isReassignWizard')) {
      var components = result.filterProperty('component_name', this.get('content.reassign.component_name'));
      components.setEach('isInstalled', false);
      this.set('servicesMasters', components);
    }
    else {
      this.set('servicesMasters', result);
    }
  },

  /**
   * Update host for components HIVE_METASTORE and WEBHCAT_SERVER according to host with HIVE_SERVER
   * @method updateHiveCoHosts
   */
  updateHiveCoHosts: function () {
    var hiveServer = this.get('selectedServicesMasters').findProperty('component_name', 'HIVE_SERVER'),
      hiveMetastore = this.get('selectedServicesMasters').findProperty('component_name', 'HIVE_METASTORE'),
      webHCatServer = this.get('selectedServicesMasters').findProperty('component_name', 'WEBHCAT_SERVER');
    if (hiveServer && hiveMetastore && webHCatServer) {
      if (!this.get('isReassignHive') && this.get('servicesMasters').objectAt(0) && !(this.get('servicesMasters').objectAt(0).component_name == 'HIVE_METASTORE')) {
        hiveMetastore.set('selectedHost', hiveServer.get('selectedHost'))
      }
      webHCatServer.set('selectedHost', hiveServer.get('selectedHost'));
    }
  }.observes('selectedServicesMasters.@each.selectedHost'),

  /**
   * select and return host for component by scheme
   * Scheme is an object that has keys which compared to number of hosts,
   * if key more that number of hosts, then return value of that key.
   * Value is index of host in hosts array.
   *
   * @param {number} noOfHosts
   * @param {object} selectionScheme
   * @return {string}
   * @method getHostForComponent
   */
  getHostForComponent: function (noOfHosts, selectionScheme) {
    var hosts = this.get('hosts');
    if (hosts.length === 1 || $.isEmptyObject(selectionScheme)) {
      return hosts[0];
    } else {
      for (var i in selectionScheme) {
        if (window.isFinite(i)) {
          if (noOfHosts < window.parseInt(i)) {
            return hosts[selectionScheme[i]];
          }
        }
      }
      return hosts[selectionScheme['else']]
    }
  },

  /**
   * Get list of hostnames for ZK Server
   * @param {number} noOfHosts
   * @returns {string[]}
   * @method getZooKeeperServer
   */
  getZooKeeperServer: function (noOfHosts) {
    var hosts = this.get('hosts');
    if (noOfHosts < 3) {
      return [hosts[0].host_name];
    } else {
      return [hosts[0].host_name, hosts[1].host_name, hosts[2].host_name];
    }
  },

  /**
   * Get hostname based on number of available hosts
   * @param {number} noOfHosts
   * @returns {string}
   * @method getServerHost
   */
  getServerHost: function (noOfHosts) {
    var hostNames = this.get('hosts').mapProperty('host_name');
    var hostExcAmbari = hostNames.without(location.hostname);
    if (noOfHosts > 1) {
      return hostExcAmbari[0];
    } else {
      return hostNames[0];
    }
  },

  /**
   * Return hostName of masterNode for specified service
   * @param componentName
   * @return {string|string[]}
   * @method selectHost
   */
  selectHost: function (componentName) {
    var noOfHosts = this.get('hosts').length;

    if (componentName === 'KERBEROS_SERVER')
      return this.getHostForComponent(noOfHosts, {"3": 1, "6": 1, "31": 3, "else": 5}).host_name;

    if (componentName === 'NAMENODE')
      return this.getHostForComponent(noOfHosts, {"else": 0}).host_name;

    if (componentName === 'SECONDARY_NAMENODE')
      return this.getHostForComponent(noOfHosts, {"else": 1}).host_name;

    if (componentName === 'HBASE_MASTER')
      return [this.getHostForComponent(noOfHosts, {"3": 0, "6": 0, "31": 2, "else": 3}).host_name];

    if (componentName === 'ZOOKEEPER_SERVER')
      return this.getZooKeeperServer(noOfHosts);

    if (['JOBTRACKER', 'HISTORYSERVER', 'RESOURCEMANAGER', 'APP_TIMELINE_SERVER'].contains(componentName))
      return this.getHostForComponent(noOfHosts, {"3": 1, "6": 1, "31": 1, "else": 2}).host_name;

    if (['OOZIE_SERVER', 'FALCON_SERVER'].contains(componentName))
      return this.getHostForComponent(noOfHosts, {"3": 1, "6": 1, "31": 2, "else": 3}).host_name;

    if (['HIVE_SERVER', 'HIVE_METASTORE', 'WEBHCAT_SERVER'].contains(componentName))
      return this.getHostForComponent(noOfHosts, {"3": 1, "6": 1, "31": 2, "else": 4}).host_name;

    if (['STORM_UI_SERVER', 'DRPC_SERVER', 'STORM_REST_API', 'NIMBUS', 'GANGLIA_SERVER', 'NAGIOS_SERVER', 'HUE_SERVER'].contains(componentName))
      return this.getServerHost(noOfHosts);

    return '';
  },

  /**
   * On change callback for inputs
   * @param {string} componentName
   * @param {string} selectedHost
   * @param {number} zId
   * @method assignHostToMaster
   */
  assignHostToMaster: function (componentName, selectedHost, zId) {
    var flag = this.isHostNameValid(componentName, selectedHost);
    this.updateIsHostNameValidFlag(componentName, zId, flag);
    if (zId) {
      this.get('selectedServicesMasters').filterProperty('component_name', componentName).findProperty("zId", zId).set("selectedHost", selectedHost);
    }
    else {
      this.get('selectedServicesMasters').findProperty("component_name", componentName).set("selectedHost", selectedHost);
    }
  },

  /**
   * Determines if hostName is valid for component:
   * <ul>
   *  <li>host name shouldn't be empty</li>
   *  <li>host should exist</li>
   *  <li>host should have only one component with <code>componentName</code></li>
   * </ul>
   * @param {string} componentName
   * @param {string} selectedHost
   * @returns {boolean} true - valid, false - invalid
   * @method isHostNameValid
   */
  isHostNameValid: function (componentName, selectedHost) {
    return (selectedHost.trim() !== '') &&
      this.get('hosts').mapProperty('host_name').contains(selectedHost) &&
      (this.get('selectedServicesMasters').
        filterProperty('component_name', componentName).
        mapProperty('selectedHost').
        filter(function (h) {
          return h === selectedHost;
        }).length <= 1);
  },

  /**
   * Update <code>isHostNameValid</code> property with <code>flag</code> value
   * for component with name <code>componentName</code> and
   * <code>zId</code>-property equal to <code>zId</code>-parameter value
   * @param {string} componentName
   * @param {number} zId
   * @param {bool} flag
   * @method updateIsHostNameValidFlag
   */
  updateIsHostNameValidFlag: function (componentName, zId, flag) {
    if (componentName) {
      if (zId) {
        this.get('selectedServicesMasters').filterProperty('component_name', componentName).findProperty("zId", zId).set("isHostNameValid", flag);
      } else {
        this.get('selectedServicesMasters').findProperty("component_name", componentName).set("isHostNameValid", flag);
      }
    }
  },

  /**
   * Returns last component of selected type
   * @param {string} componentName
   * @return {Em.Object|null}
   * @method last
   */
  last: function (componentName) {
    return this.get("selectedServicesMasters").filterProperty("component_name", componentName).get("lastObject");
  },

  /**
   * Add new component to ZooKeeper Server and Hbase master
   * @param {string} componentName
   * @return {bool} true - added, false - not added
   * @method addComponent
   */
  addComponent: function (componentName) {
    /*
     * Logic: If ZooKeeper or Hbase service is selected then there can be
     * minimum 1 ZooKeeper or Hbase master in total, and
     * maximum 1 ZooKeeper or Hbase on every host
     */

    var maxNumMasters = this.get("hosts.length"),
      currentMasters = this.get("selectedServicesMasters").filterProperty("component_name", componentName),
      newMaster = null,
      masterHosts = null,
      suggestedHost = null,
      i = 0,
      lastMaster = null;

    if (!currentMasters.length) {
      console.log('ALERT: Zookeeper service was not selected');
      return false;
    }

    if (currentMasters.get("length") < maxNumMasters) {

      currentMasters.set("lastObject.showAddControl", false);
      currentMasters.set("lastObject.showRemoveControl", true);

      //create a new zookeeper based on an existing one
      newMaster = Em.Object.create({});
      lastMaster = currentMasters.get("lastObject");
      newMaster.set("display_name", lastMaster.get("display_name"));
      newMaster.set("component_name", lastMaster.get("component_name"));
      newMaster.set("selectedHost", lastMaster.get("selectedHost"));
      newMaster.set("isInstalled", false);

      if (currentMasters.get("length") === (maxNumMasters - 1)) {
        newMaster.set("showAddControl", false);
      } else {
        newMaster.set("showAddControl", true);
      }
      newMaster.set("showRemoveControl", true);

      //get recommended host for the new Zookeeper server
      masterHosts = currentMasters.mapProperty("selectedHost").uniq();

      for (i = 0; i < this.get("hosts.length"); i++) {
        if (!(masterHosts.contains(this.get("hosts")[i].get("host_name")))) {
          suggestedHost = this.get("hosts")[i].get("host_name");
          break;
        }
      }

      newMaster.set("selectedHost", suggestedHost);
      newMaster.set("zId", (currentMasters.get("lastObject.zId") + 1));

      this.get("selectedServicesMasters").insertAt(this.get("selectedServicesMasters").indexOf(lastMaster) + 1, newMaster);

      this.set('componentToRebalance', componentName);
      this.incrementProperty('rebalanceComponentHostsCounter');
      this.toggleProperty('hostNameCheckTrigger');
      return true;
    }
    return false;//if no more zookeepers can be added
  },

  /**
   * Remove component from ZooKeeper server or Hbase Master
   * @param {string} componentName
   * @param {number} zId
   * @return {bool} true - removed, false - no
   * @method removeComponent
   */
  removeComponent: function (componentName, zId) {
    var currentMasters = this.get("selectedServicesMasters").filterProperty("component_name", componentName);

    //work only if the Zookeeper service is selected in previous step
    if (currentMasters.length <= 1) {
      return false;
    }

    this.get("selectedServicesMasters").removeAt(this.get("selectedServicesMasters").indexOf(currentMasters.findProperty("zId", zId)));

    currentMasters = this.get("selectedServicesMasters").filterProperty("component_name", componentName);
    if (currentMasters.get("length") < this.get("hosts.length")) {
      currentMasters.set("lastObject.showAddControl", true);
    }

    if (currentMasters.get("length") === 1) {
      currentMasters.set("lastObject.showRemoveControl", false);
    }

    this.set('componentToRebalance', componentName);
    this.incrementProperty('rebalanceComponentHostsCounter');
    this.toggleProperty('hostNameCheckTrigger');
    return true;
  },

  /**
   * Submit button click handler
   * @metohd submit
   */
  submit: function () {
    this.getIsSubmitDisabled();
    if (!this.get('submitDisabled')) {
      App.router.send('next');
    }
  }

});
