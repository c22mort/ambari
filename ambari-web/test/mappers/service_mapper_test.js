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

var Ember = require('ember');
var App = require('app');

require('utils/helper');
require('mappers/server_data_mapper');
require('mappers/service_metrics_mapper');

describe('App.serviceMetricsMapper', function () {

  describe('#hbaseMapper', function() {

    it ('Round Average Load', function() {
      var tests = [
        {
          components: [
            {
                ServiceComponentInfo: {
                  AverageLoad: 1.23456789,
                  component_name: "HBASE_MASTER",
                  RegionsInTransition : [ ]
                }
              }
          ],
          e: '1.23'
        },
        {
          components: [
            {
                ServiceComponentInfo: {
                  AverageLoad: 1.00,
                  component_name: "HBASE_MASTER",
                  RegionsInTransition : [ ]
                }
              }
          ],
          e: '1.00'
        },
        {
          components: [
            {
                ServiceComponentInfo: {
                  AverageLoad: 1,
                  component_name: "HBASE_MASTER",
                  RegionsInTransition : [ ]
                }
              }
          ],
          e: '1.00'
        },
        {
          components: [
            {
                ServiceComponentInfo: {
                  AverageLoad: 1.2,
                  component_name: "HBASE_MASTER",
                  RegionsInTransition : [ ]
                }
              }
          ],
          e: '1.20'
        }
      ];
      tests.forEach(function(test) {
        var result = App.serviceMetricsMapper.hbaseMapper(test);
        expect(result.average_load).to.equal(test.e);
      });
    });
  });

});
