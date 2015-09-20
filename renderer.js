/* jshint node: true */

require('angular');
require('angular-i18n/angular-locale_fr-fr');
require('angular-ui-router');
require('angular-resource');

//global.angular = angular;

//require('./app/components');
require('./app/shared');

//require('./app.js');

angular
.module('dashboard', ['ui.router', 'shared'])
.controller('tempCtrl', require('./tempCtrl'))
;