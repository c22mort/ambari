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

/**
 * Remove spaces at beginning and ending of line.
 * @example
 *  var str = "  I'm a string  "
 *  str.trim() // return "I'm a string"
 * @method trim
 * @return {string}
 */
String.prototype.trim = function () {
  return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};
/**
 * Determines whether string end within another string.
 *
 * @method endsWith
 * @param suffix {string}  substring for search
 * @return {boolean}
 */
String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
/**
 * Determines whether string start within another string.
 *
 * @method startsWith
 * @param prefix {string} substring for search
 * @return {boolean}
 */
String.prototype.startsWith = function (prefix){
  return this.indexOf(prefix) == 0;
};
/**
 * Determines whether string founded within another string.
 *
 * @method contains
 * @param substring {string} substring for search
 * @return {boolean}
 */
String.prototype.contains = function(substring) {
  return this.indexOf(substring) != -1;
};
/**
 * Capitalize the first letter of string.
 * @method capitalize
 * @return {string}
 */
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * Finds the value in an object where this string is a key.
 * Optionally, the index of the key can be provided where the
 * value of the nth key in the hierarchy is returned.
 *
 * Example:
 *  var tofind = 'smart';
 *  var person = {'name': 'Bob Bob', 'smart': 'no', 'age': '28', 'personality': {'smart': 'yes', 'funny': 'yes', 'emotion': 'happy'} };
 *  tofind.findIn(person); // 'no'
 *  tofind.findIn(person, 0); // 'no'
 *  tofind.findIn(person, 1); // 'yes'
 *  tofind.findIn(person, 2); // null
 *
 *  @method findIn
 *  @param multi {object}
 *  @param index {number} Occurrence count of this key
 *  @return {*} Value of key at given index
 */
String.prototype.findIn = function(multi, index, _foundValues) {
  if (!index) {
    index = 0;
  }
  if (!_foundValues) {
    _foundValues = [];
  }
  multi = multi || '';
  var value = null;
  var str = this.valueOf();
  if (typeof multi == 'object') {
    for ( var key in multi) {
      if (value != null) {
        break;
      }
      if (key == str) {
        _foundValues.push(multi[key]);
      }
      if (_foundValues.length - 1 == index) {
        // Found the value
        return _foundValues[index];
      }
      if (typeof multi[key] == 'object') {
        value = value || this.findIn(multi[key], index, _foundValues);
      }
    }
  }
  return value;
};
/**
 * Replace {i} with argument. where i is number of argument to replace with.
 * @example
 *  var str = "{0} world{1}";
 *  str.format("Hello", "!") // return "Hello world!"
 *
 * @method format
 * @return {string}
 */
String.prototype.format = function () {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};
/**
 * Wrap words in string within template.
 *
 * @method highlight
 * @param {string[]} words - words to wrap
 * @param {string} [highlightTemplate="<b>{0}</b>"] - template for wrapping
 * @return {string}
 */
String.prototype.highlight = function (words, highlightTemplate) {
  var self = this;
  highlightTemplate = highlightTemplate ? highlightTemplate : "<b>{0}</b>";

  words.forEach(function (word) {
    var searchRegExp = new RegExp("\\b" + word + "\\b", "gi");
    self = self.replace(searchRegExp, function (found) {
      return highlightTemplate.format(found);
    });
  });

  return self;
};
/**
 * Convert time in milliseconds to object contained days, hours and minutes.
 * @typedef ConvertedTime
 *  @type {Object}
 *  @property {number} d - days
 *  @property {number} h - hours
 *  @property {string} m - minutes
 * @example
 *  var time = 1000000000;
 *  time.toDaysHoursMinutes() // {d: 11, h: 13, m: "46.67"}
 *
 * @method toDaysHoursMinutes
 * @return {object}
 */
Number.prototype.toDaysHoursMinutes = function () {
  var formatted = {},
    dateDiff = this,
    secK = 1000, //ms
    minK = 60 * secK, // sec
    hourK = 60 * minK, // sec
    dayK = 24 * hourK;

  dateDiff = parseInt(dateDiff);
  formatted.d = Math.floor(dateDiff / dayK);
  dateDiff -= formatted.d * dayK;
  formatted.h = Math.floor(dateDiff / hourK);
  dateDiff -= formatted.h * hourK;
  formatted.m = (dateDiff / minK).toFixed(2);

  return formatted;
};
/**
 Sort an array by the key specified in the argument.
 Handle only native js objects as element of array, not the Ember's object.

 Can be used as alternative to sortProperty method of Ember library
 in order to speed up executing on large data volumes

 @method sortBy
 @param {String} path name(s) to sort on
 @return {Array} The sorted array.
 */
Array.prototype.sortPropertyLight = function (path) {
  var realPath = (typeof path === "string") ? path.split('.') : [];
  this.sort(function (a, b) {
    var aProperty = a;
    var bProperty = b;
    realPath.forEach(function (key) {
      aProperty = aProperty[key];
      bProperty = bProperty[key];
    });
    if (aProperty > bProperty) return 1;
    if (aProperty < bProperty) return -1;
    return 0;
  });
  return this;
};
/** @namespace Em **/
Em.CoreObject.reopen({
  t:function (key, attrs) {
    return Em.I18n.t(key, attrs)
  }
});

/** @namespace Em.Handlebars **/
Em.Handlebars.registerHelper('log', function (variable) {
  console.log(variable);
});

Em.Handlebars.registerHelper('warn', function (variable) {
  console.warn(variable);
});

Em.Handlebars.registerHelper('highlight', function (property, words, fn) {
  var context = (fn.contexts && fn.contexts[0]) || this;
  property = Em.Handlebars.getPath(context, property, fn);

  words = words.split(";");

//  if (highlightTemplate == undefined) {
  var highlightTemplate = "<b>{0}</b>";
//  }

  words.forEach(function (word) {
    var searchRegExp = new RegExp("\\b" + word + "\\b", "gi");
    property = property.replace(searchRegExp, function (found) {
      return highlightTemplate.format(found);
    });
  });

  return new Em.Handlebars.SafeString(property);
});
/**
 * @namespace App
 */
App = require('app');

/**
 * Certain variables can have JSON in string
 * format, or in JSON format itself.
 *
 * @memberof App
 * @function parseJson
 * @param {string|object}
 * @return {object}
 */
App.parseJSON = function (value) {
  if (typeof value == "string") {
    return jQuery.parseJSON(value);
  }
  return value;
};
/**
 * Check for empty <code>Object</code>, built in Em.isEmpty()
 * doesn't support <code>Object</code> type
 *
 * @memberof App
 * @method isEmptyObject
 * @param obj {Object}
 * @return {Boolean}
 */
App.isEmptyObject = function(obj) {
  var empty = true;
  for (var prop in obj) { if (obj.hasOwnProperty(prop)) {empty = false; break;} }
  return empty;
}
/**
 * Returns object with defined keys only.
 *
 * @memberof App
 * @method permit
 * @param {Object} obj - input object
 * @param {String|Array} keys - allowed keys
 * @return {Object}
 */
App.permit = function(obj, keys) {
  var result = {};
  if (typeof obj !== 'object' || App.isEmptyObject(obj)) return result;
  if (typeof keys == 'string') keys = Array(keys);
  keys.forEach(function(key) {
    if (obj.hasOwnProperty(key))
      result[key] = obj[key];
  });
  return result;
};
/**
 *
 * @namespace App
 * @namespace App.format
 */
App.format = {
  /**
   * @memberof App.format
   * @type {object}
   * @property components
   */
  components: {
    'APP_TIMELINE_SERVER': 'App Timeline Server',
    'DATANODE': 'DataNode',
    'DECOMMISSION_DATANODE': 'Update Exclude File',
    'DRPC_SERVER': 'DRPC Server',
    'FALCON': 'Falcon',
    'FALCON_CLIENT': 'Falcon Client',
    'FALCON_SERVER': 'Falcon Server',
    'FALCON_SERVICE_CHECK': 'Falcon Service Check',
    'FLUME_HANDLER': 'Flume Agent',
    'FLUME_SERVICE_CHECK': 'Flume Service Check',
    'GANGLIA_MONITOR': 'Ganglia Monitor',
    'GANGLIA_SERVER': 'Ganglia Server',
    'GLUSTERFS_CLIENT': 'GLUSTERFS Client',
    'GLUSTERFS_SERVICE_CHECK': 'GLUSTERFS Service Check',
    'GMETAD_SERVICE_CHECK': 'Gmetad Service Check',
    'GMOND_SERVICE_CHECK': 'Gmond Service Check',
    'HADOOP_CLIENT': 'Hadoop Client',
    'HBASE_CLIENT': 'HBase Client',
    'HBASE_MASTER': 'HBase Master',
    'HBASE_REGIONSERVER': 'RegionServer',
    'HBASE_SERVICE_CHECK': 'HBase Service Check',
    'HCAT': 'HCat',
    'HCAT_SERVICE_CHECK': 'HCat Service Check',
    'HDFS_CLIENT': 'HDFS Client',
    'HDFS_SERVICE_CHECK': 'HDFS Service Check',
    'HISTORYSERVER': 'History Server',
    'HIVE_CLIENT': 'Hive Client',
    'HIVE_METASTORE': 'Hive Metastore',
    'HIVE_SERVER': 'HiveServer2',
    'HIVE_SERVICE_CHECK': 'Hive Service Check',
    'HUE_SERVER': 'Hue Server',
    'JAVA_JCE': 'Java JCE',
    'JOBTRACKER': 'JobTracker',
    'JOBTRACKER_SERVICE_CHECK': 'JobTracker Service Check',
    'JOURNALNODE': 'JournalNode',
    'KERBEROS_ADMIN_CLIENT': 'Kerberos Admin Client',
    'KERBEROS_CLIENT': 'Kerberos Client',
    'KERBEROS_SERVER': 'Kerberos Server',
    'MAPREDUCE2_CLIENT': 'MapReduce2 Client',
    'MAPREDUCE2_SERVICE_CHECK': 'MapReduce2 Service Check',
    'MAPREDUCE_CLIENT': 'MapReduce Client',
    'MAPREDUCE_SERVICE_CHECK': 'MapReduce Service Check',
    'MYSQL_SERVER': 'MySQL Server',
    'NAGIOS_SERVER': 'Nagios Server',
    'NAMENODE': 'NameNode',
    'NAMENODE_SERVICE_CHECK': 'NameNode Service Check',
    'NIMBUS': 'Nimbus',
    'NODEMANAGER': 'NodeManager',
    'OOZIE_CLIENT': 'Oozie Client',
    'OOZIE_SERVER': 'Oozie Server',
    'OOZIE_SERVICE_CHECK': 'Oozie Service Check',
    'PIG': 'Pig',
    'PIG_SERVICE_CHECK': 'Pig Service Check',
    'RESOURCEMANAGER': 'ResourceManager',
    'SECONDARY_NAMENODE': 'SNameNode',
    'SQOOP': 'Sqoop',
    'SQOOP_SERVICE_CHECK': 'Sqoop Service Check',
    'STORM_REST_API': 'Storm REST API Server',
    'STORM_SERVICE_CHECK': 'Storm Service Check',
    'STORM_UI_SERVER': 'Storm UI Server',
    'SUPERVISOR': 'Supervisor',
    'TASKTRACKER': 'TaskTracker',
    'TEZ_CLIENT': 'Tez Client',
    'WEBHCAT_SERVER': 'WebHCat Server',
    'WEBHCAT_SERVICE_CHECK': 'WebHCat Service Check',
    'YARN_CLIENT': 'YARN Client',
    'YARN_SERVICE_CHECK': 'YARN Service Check',
    'ZKFC': 'ZKFailoverController',
    'ZOOKEEPER_CLIENT': 'ZooKeeper Client',
    'ZOOKEEPER_QUORUM_SERVICE_CHECK': 'ZK Quorum Service Check',
    'ZOOKEEPER_SERVER': 'ZooKeeper Server',
    'ZOOKEEPER_SERVICE_CHECK': 'ZooKeeper Service Check',
    'CLIENT': 'Client'
  },

  /**
   * @memberof App.format
   * @property command
   * @type {object}
   */
  command: {
    'INSTALL': 'Install',
    'UNINSTALL': 'Uninstall',
    'START': 'Start',
    'STOP': 'Stop',
    'EXECUTE': 'Execute',
    'ABORT': 'Abort',
    'UPGRADE': 'Upgrade',
    'RESTART': 'Restart',
    'SERVICE_CHECK': 'Check',
    'Excluded:': 'Decommission:',
    'Included:': 'Recommission:'
  },

  /**
   * convert role to readable string
   *
   * @memberof App.format
   * @method role
   * @param {string} role
   * return {string}
   */
  role:function (role) {
    return this.components[role] ? this.components[role] : '';
  },

  /**
   * convert command_detail to readable string, show the string for all tasks name
   *
   * @memberof App.format
   * @method commandDetail
   * @param {string} command_detail
   * @return {string}
   */
  commandDetail: function (command_detail) {
    var detailArr = command_detail.split(' ');
    var self = this;
    var result = '';
    detailArr.forEach( function(item) {
      // if the item has the pattern SERVICE/COMPONENT, drop the SERVICE part
      if (item.contains('/')) {
        item = item.split('/')[1];
      }
      // ignore 'DECOMMISSION', command came from 'excluded/included'
      if (item == 'DECOMMISSION,') {
        item = '';
      }
      if (self.components[item]) {
        result = result + ' ' + self.components[item];
      } else if (self.command[item]) {
        result = result + ' ' + self.command[item];
      } else {
        result = result + ' ' + item;
      }
    });
    if (result === ' nagios_update_ignore ACTIONEXECUTE') {
       result = Em.I18n.t('common.maintenance.task');
    }
    return result;
  },

  /**
   * Convert uppercase status name to downcase.
   * <br>
   * <br>PENDING - Not queued yet for a host
   * <br>QUEUED - Queued for a host
   * <br>IN_PROGRESS - Host reported it is working
   * <br>COMPLETED - Host reported success
   * <br>FAILED - Failed
   * <br>TIMEDOUT - Host did not respond in time
   * <br>ABORTED - Operation was abandoned
   *
   * @memberof App.format
   * @method taskStatus
   * @param {string} _taskStatus
   * @return {string}
   *
   */
  taskStatus:function (_taskStatus) {
    return _taskStatus.toLowerCase();
  }
};

/**
 * wrapper to bootstrap popover
 * fix issue when popover stuck on view routing
 *
 * @memberof App
 * @method popover
 * @param {DOMElement} self
 * @param {object} options
 */
App.popover = function (self, options) {
  self.popover(options);
  self.on("remove DOMNodeRemoved", function () {
    $(this).trigger('mouseleave');
  });
};

/**
 * wrapper to bootstrap tooltip
 * fix issue when tooltip stuck on view routing
 * @memberof App
 * @method tooltip
 * @param {DOMElement} self
 * @param {object} options
 */
App.tooltip = function (self, options) {
  self.tooltip(options);
  /* istanbul ignore next */
  self.on("remove DOMNodeRemoved", function () {
    $(this).trigger('mouseleave');
  });
};

/**
 * wrapper to Date().getTime()
 * fix issue when client clock and server clock not sync
 *
 * @memberof App
 * @method dateTime
 * @return {Number} timeStamp of current server clock
 */
App.dateTime = function() {
  return new Date().getTime() + App.clockDistance;
};

/**
 * Helper function for bound property helper registration
 * @memberof App
 * @method registerBoundHelper
 * @param name {String} name of helper
 * @param view {Em.View} view
 */
App.registerBoundHelper = function(name, view) {
  Em.Handlebars.registerHelper(name, function(property, options) {
    options.hash.contentBinding = property;
    return Em.Handlebars.helpers.view.call(this, view, options);
  });
};

/*
 * Return singular or plural word based on Em.I18n property key.
 *
 *  Example: {{pluralize hostsCount singular="t:host" plural="t:hosts"}}
 */
App.registerBoundHelper('pluralize', Em.View.extend({
  tagName: 'span',
  template: Em.Handlebars.compile('{{view.wordOut}}'),

  wordOut: function() {
    var count, singular, plural;
    count = this.get('content');
    singular = this.get('singular');
    plural = this.get('plural');
    return this.getWord(count, singular, plural);
  }.property('content'),

  getWord: function(count, singular, plural) {
    singular = this.tDetect(singular);
    plural = this.tDetect(plural);
    if (singular && plural) {
      if (count > 1) {
        return plural;
      } else {
        return singular;
      }
    }
    return '';
  },
  /*
   * Detect for Em.I18n.t reference call
   * @params word {String}
   * return {String}
  */
  tDetect: function(word) {
    var splitted = word.split(':');
    if (splitted.length > 1 && splitted[0] == 't') {
      return Em.I18n.t(splitted[1]);
    } else {
      return splitted[0];
    }
  }
  })
);
/**
 * Return defined string instead of empty if value is null/undefined
 * by default is `n/a`.
 *
 * @param empty {String} - value instead of empty string (not required)
 *  can be used with Em.I18n pass value started with't:'
 *
 * Examples:
 *
 * default value will be returned
 * {{formatNull service.someValue}}
 *
 * <code>empty<code> will be returned
 * {{formatNull service.someValue empty="I'm empty"}}
 *
 * Em.I18n translation will be returned
 * {{formatNull service.someValue empty="t:my.key.to.translate"
 */
App.registerBoundHelper('formatNull', Em.View.extend({
  tagName: 'span',
  template: Em.Handlebars.compile('{{view.result}}'),

  result: function() {
    var emptyValue = this.get('empty') ? this.get('empty') : Em.I18n.t('services.service.summary.notAvailable');
    emptyValue = emptyValue.startsWith('t:') ? Em.I18n.t(emptyValue.substr(2, emptyValue.length)) : emptyValue;
    return (this.get('content') || this.get('content') == 0) ? this.get('content') : emptyValue;
  }.property('content')
}));

/**
 * Return formatted string with inserted <code>wbr</code>-tag after each dot
 *
 * @param {String} content
 *
 * Examples:
 *
 * returns 'apple'
 * {{formatWordBreak 'apple'}}
 *
 * returns 'apple.<wbr />banana'
 * {{formatWordBreak 'apple.banana'}}
 *
 * returns 'apple.<wbr />banana.<wbr />uranium'
 * {{formatWordBreak 'apple.banana.uranium'}}
 */
App.registerBoundHelper('formatWordBreak', Em.View.extend({
  tagName: 'span',
  template: Em.Handlebars.compile('{{{view.result}}}'),

  /**
   * @type {string}
   */
  result: function() {
    return this.get('content') && this.get('content').replace(/\./g, '.<wbr />');
  }.property('content')
}));

/**
 * Ambari overrides the default date transformer.
 * This is done because of the non-standard data
 * sent. For example Nagios sends date as "12345678".
 * The problem is that it is a String and is represented
 * only in seconds whereas Javascript's Date needs
 * milliseconds representation.
 */
DS.attr.transforms.date = {
  from: function (serialized) {
    var type = typeof serialized;
    if (type === Em.I18n.t('common.type.string')) {
      serialized = parseInt(serialized);
      type = typeof serialized;
    }
    if (type === Em.I18n.t('common.type.number')) {
      if (!serialized ){  //serialized timestamp = 0;
        return 0;
      }
      // The number could be seconds or milliseconds.
      // If seconds, then the length is 10
      // If milliseconds, the length is 13
      if (serialized.toString().length < 13) {
        serialized = serialized * 1000;
      }
      return new Date(serialized);
    } else if (serialized === null || serialized === undefined) {
      // if the value is not present in the data,
      // return undefined, not null.
      return serialized;
    } else {
      return null;
    }
  },
  to: function (deserialized) {
    if (deserialized instanceof Date) {
      return deserialized.getTime();
    } else if (deserialized === undefined) {
      return undefined;
    } else {
      return null;
    }
  }
};

DS.attr.transforms.object = {
  from: function(serialized) {
    return Ember.none(serialized) ? null : Object(serialized);
  },

  to: function(deserialized) {
    return Ember.none(deserialized) ? null : Object(deserialized);
  }
};

/**
 * Allows EmberData models to have array properties.
 *
 * Declare the property as <code>
 *  operations: DS.attr('array'),
 * </code> and
 * during load provide a JSON array for value.
 *
 * This transform simply assigns the same array in both directions.
 */
DS.attr.transforms.array = {
  from : function(serialized) {
    return serialized;
  },
  to : function(deserialized) {
    return deserialized;
  }
};
