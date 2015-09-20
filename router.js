module.exports = function($httpProvider, $stateProvider, $urlRouterProvider){

	$urlRouterProvider.otherwise("/");

	$stateProvider.state('dashboard', {
		url: '/',
		templateUrl: 'app/components/dashboard/index.html',
		controller: require('./components/dashboard/index')
	});

};
