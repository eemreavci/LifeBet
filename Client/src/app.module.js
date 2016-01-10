(function() {
	'use strict';

	angular.module('app', ['authorization', 'navbar', 'controller.bet', 'controller.friends', 'controller.profile', 'ui.router', 'angularMoment', 'LocalStorageModule'])

	.config(['$stateProvider', '$urlRouterProvider', 'localStorageServiceProvider', function ($stateProvider, $urlRouterProvider, localStorageServiceProvider) {
		$urlRouterProvider.otherwise('/home');

		$stateProvider

			.state('home', {
				url 		  : '/home',
				templateUrl   : 'pages/home.html',
				loginRequired : true
			})
			.state('friends', {
				url 		  : '/friends',
				templateUrl   : 'pages/friends.html',
				loginRequired : true
			})
			.state('profile', {
				url 		  : '/profile/:user_id',
				templateUrl   : 'pages/profile.html',
				loginRequired : true
			});

		localStorageServiceProvider
		    .setPrefix('lifebet')
		    .setStorageType('localStorage')
		    .setNotify(true, true)
	}])
	.run(['$state', '$rootScope', 'localStorageService', function($state, $rootScope, localStorageService) {
	    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
	    	console.log(localStorageService.get('token'));
	        if (toState.loginRequired && !localStorageService.get('token')) {
	            // If login required and no token exists
	            console.log("Should login first!");
	            e.preventDefault();
	            $state.go('login');
	        }
	    });
	}]);


})();