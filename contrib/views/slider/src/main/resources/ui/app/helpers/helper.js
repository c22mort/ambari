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


String.prototype.format = function () {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};

/**
 * Helper function for bound property helper registration
 * @memberof App
 * @method registerBoundHelper
 * @param name {String} name of helper
 * @param view {Em.View} view
 */
App.registerBoundHelper = function(name, view) {
  Ember.Handlebars.registerHelper(name, function(property, options) {
    options.hash.contentBinding = property;
    return Ember.Handlebars.helpers.view.call(this, view, options);
  });
};


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
  template: Ember.Handlebars.compile('{{{view.result}}}'),

  /**
   * @type {string}
   */
  result: function() {
    return this.get('content') && this.get('content').replace(/\//g, '/<wbr />');
  }.property('content')
}));