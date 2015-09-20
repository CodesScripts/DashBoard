angular
.module('shared', ['ngResource'])
.directive('ngLogin', require('./login/loginDirective') )
.factory('loginService', require('./login/loginService') )
;