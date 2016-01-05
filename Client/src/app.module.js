(function() {
	'use strict';

	angular.module('app', ['ui.route', 'login', 'angularMoment', 'LocalStorageModule'])

	.config(['$stateProvider', '$urlRouterProvider', 'localStorageServiceProvider', function ($stateProvider, $urlRouterProvider, localStorageServiceProvider) {
		$urlRouterProvider.otherwise('/home');

		$stateProvider

			.state('home', {
				url 		  : '/home',
				templateUrl   : 'pages/home.html',
				loginRequired : true
			});

		localStorageServiceProvider
		    .setPrefix('lifebet')
		    .setStorageType('localStorage')
		    .setNotify(true, true)
	}])
	.run(['$state', '$rootScope', 'localStorageService', function($state, $rootScope, localStorageService) {
	    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {

	        if (toState.loginRequired && !localStorageService.get('token')) {
	            // If login required and no token exists
	            e.preventDefault();
	            $state.go('login');
	        }
	    });
	}]);
})();