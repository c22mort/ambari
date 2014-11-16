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


Em.I18n.translations = {

  'ok': 'OK',
  'yes': 'Yes',
  'no': 'No',

  'common' : {
    'show': 'Show',
    'actions': 'Actions',
    'cancel': 'Cancel',
    'name': "Name",
    'back': "Back",
    'value': "Value",
    'next': "Next",
    'quickLinks': "Quick Links",
    'summary': 'Summary',
    'configs': 'Configs',
    'metrics': 'Metrics',
    'confirmation': 'Confirmation',
    'configuration': 'Configuration',
    'finish': 'Finish',
    'components': 'Components',
    'type': 'Type',
    'status': 'Status',
    'started': 'Started',
    'finished': 'Finished',
    'diagnostics': 'Diagnostics'
  },

  'popup.confirmation.commonHeader': 'Confirmation',
  'question.sure':'Are you sure?',

  'tableView.filters.all': 'All',
  'tableView.filters.filtered': 'Filtered',
  'tableView.filters.clearFilters': 'Clear filters',
  'tableView.filters.paginationInfo': '{0} - {1} of {2}',
  'tableView.filters.clearAllFilters': 'clear filters',
  'tableView.filters.showAll': 'Show All',
  'tableView.filters.clearSelection': 'clear selection All',
  'tableView.filters.noItems' : 'There are no items to show',

  'slider.apps.title': 'Slider Apps',
  'slider.apps.create': 'Create App',
  'sliderApps.filters.info': '{0} of {1} sliders showing',

  'wizard.name': 'Create Slider App',
  'wizard.step1.name': 'Select Type',
  'wizard.step1.header': 'Available Types',
  'wizard.step1.description': 'Description',
  'wizard.step1.typeDescription': 'Deploys {0} cluster on YARN.',
  'wizard.step1.nameFormatError': 'App Name should consist only of letters, numbers, \'-\', \'_\' and first character should be a letter.',
  'wizard.step1.nameRepeatError': 'App with entered Name already exists.',
  'wizard.step2.name': 'Allocate Resources',
  'wizard.step2.header': 'HBase application requires resources to be allocated on the cluster. Provide resource allocation requests for each component of the application below.',
  'wizard.step2.table.instances': 'Number of Instances',
  'wizard.step2.table.memory': 'YARN Memory (MB)',
  'wizard.step2.table.cpu': 'YARN	CPU	Cores',
  'wizard.step2.error.numbers': 'All fields should be filled. Only integer numbers allowed.',
  'wizard.step3.name': 'Configuration',
  'wizard.step3.header': 'Provide	configuration	details	for	HBase	application',
  'wizard.step3.error': 'Only \"key\":\"value\" format allowed.',
  'wizard.step4.name': 'Deploy',
  'wizard.step4.appName': 'App Name',
  'wizard.step4.appType': 'App Type'
};