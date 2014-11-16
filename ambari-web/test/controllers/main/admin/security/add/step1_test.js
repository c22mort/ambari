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

require('controllers/main/admin/security/add/step1');
require('models/service');

describe('App.MainAdminSecurityAddStep1Controller', function () {

  var controller = App.MainAdminSecurityAddStep1Controller.create({
    content: {}
  });

  describe('#isATSInstalled()', function() {
    it('content.services is empty', function() {
      controller.set('content.services', []);
      expect(controller.isATSInstalled()).to.be.false;
    });
    it('content.services does not contain YARN', function() {
      controller.set('content.services', [{serviceName: 'HDFS'}]);
      expect(controller.isATSInstalled()).to.be.false;
    });
    it('YARN does not have ATS', function() {
      sinon.stub(App.Service, 'find', function(){
        return Em.Object.create({hostComponents: []})
      });
      controller.set('content.services', [{serviceName: 'YARN'}]);
      expect(controller.isATSInstalled()).to.be.false;
      App.Service.find.restore();
    });
    it('YARN has ATS', function() {
      sinon.stub(App.Service, 'find', function(){
        return Em.Object.create({hostComponents: [{
          componentName: 'APP_TIMELINE_SERVER'
        }]})
      });
      controller.set('content.services', [{serviceName: 'YARN'}]);
      expect(controller.isATSInstalled()).to.be.true;
      App.Service.find.restore();
    });
  });
});
