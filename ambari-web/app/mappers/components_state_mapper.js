/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

var App = require('app');
var stringUtils = require('utils/string_utils');

App.componentsStateMapper = App.QuickDataMapper.create({

  model: App.Service,
  paths: {
    INSTALLED_PATH: 'ServiceComponentInfo.installed_count',
    STARTED_PATH: 'ServiceComponentInfo.started_count',
    TOTAL_PATH: 'ServiceComponentInfo.total_count'
  },
  configMap: {
    'DATANODE': {
      data_nodes_started: 'STARTED_PATH',
      data_nodes_installed: 'INSTALLED_PATH',
      data_nodes_total: 'TOTAL_PATH'
    },
    'NODEMANAGER': {
      node_managers_started: 'STARTED_PATH',
      node_managers_installed: 'INSTALLED_PATH',
      node_managers_total: 'TOTAL_PATH'
    },
    'TASKTRACKER': {
      task_trackers_started: 'STARTED_PATH',
      task_trackers_installed: 'INSTALLED_PATH',
      task_trackers_total: 'TOTAL_PATH'
    },
    'HBASE_REGIONSERVER': {
      region_servers_started: 'STARTED_PATH',
      region_servers_installed: 'INSTALLED_PATH',
      region_servers_total: 'TOTAL_PATH'
    },
    'GANGLIA_MONITOR': {
      ganglia_monitors_started: 'STARTED_PATH',
      ganglia_monitors_installed: 'INSTALLED_PATH',
      ganglia_monitors_total: 'TOTAL_PATH'
    },
    'SUPERVISOR': {
      super_visors_started: 'STARTED_PATH',
      super_visors_installed: 'INSTALLED_PATH',
      super_visors_total: 'TOTAL_PATH'
    },
    'MAPREDUCE2_CLIENT': {
      map_reduce2_clients: 'INSTALLED_PATH'
    },
    'TEZ_CLIENT': {
      installed_clients: 'INSTALLED_PATH'
    },
    'HIVE_CLIENT': {
      installed_clients: 'INSTALLED_PATH'
    },
    'FALCON_CLIENT': {
      installed_clients: 'INSTALLED_PATH'
    },
    'OOZIE_CLIENT': {
      installed_clients: 'INSTALLED_PATH'
    },
    'ZOOKEEPER_CLIENT': {
      installed_clients: 'INSTALLED_PATH'
    },
    'PIG': {
      installed_clients: 'INSTALLED_PATH'
    },
    'SQOOP': {
      installed_clients: 'INSTALLED_PATH'
    },
    'YARN_CLIENT': {
      installed_clients: 'INSTALLED_PATH'
    },
    'HDFS_CLIENT': {
      installed_clients: 'INSTALLED_PATH'
    },
    'FLUME_HANDLER': {
      flume_handlers_total: 'TOTAL_PATH'
    }
  },
  /**
   * get formatted component config
   * @param componentName
   * @return {Object}
   */
  getComponentConfig: function (componentName) {
    var config = {};
    var componentConfig = this.get('configMap')[componentName];
    var paths = this.get('paths');

    for (var property in componentConfig) {
      if (paths[componentConfig[property]]) {
        config[property] = paths[componentConfig[property]];
      }
    }
    return config;
  },
  /**
   * get service extended model if it has one
   * @param serviceName
   * @return {Object|null}
   */
  getExtendedModel: function (serviceName) {
    if (App[App.Service.extendedModel[serviceName]]) {
      return App[App.Service.extendedModel[serviceName]].find(serviceName);
    }
    return null;
  },

  map: function (json) {
    console.time('App.componentsStateMapper execution time');

    if (json.items) {
      json.items.forEach(function (item) {
        var componentConfig = this.getComponentConfig(item.ServiceComponentInfo.component_name);
        var parsedItem = this.parseIt(item, componentConfig);
        var service = App.Service.find(item.ServiceComponentInfo.service_name);
        var extendedModel = this.getExtendedModel(item.ServiceComponentInfo.service_name);
        var cacheService = App.cache['services'].findProperty('ServiceInfo.service_name', item.ServiceComponentInfo.service_name);

        for (var i in parsedItem) {
          if (service.get('isLoaded')) {
            cacheService[i] = parsedItem[i];
            service.set(stringUtils.underScoreToCamelCase(i), parsedItem[i]);
            if (extendedModel) {
              extendedModel.set(stringUtils.underScoreToCamelCase(i), parsedItem[i]);
            }
          }
        }
      }, this)
    }
    console.timeEnd('App.componentsStateMapper execution time');
  }
});
