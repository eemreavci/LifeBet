(function() {
	'use strict';
	angular.module('login', ['ui.router', 'LocalStorageModule'])
		.config(function($stateProvider) {
			$stateProvider.state('login', {
				url: '/login',
				controller: 'LoginController',
				templateUrl: 'login.html',
				loginRequired: false
			})
		})
		.controller('LoginController', ['$http', '$state', 'localStorageService', LoginController]);

	function LoginController($http, localStorageService) {
		var vm = this;
		vm.login = function() {
			$http.post("/api/login", {email: vm.email, password: vm.password})
				.then(function(response) {
					localStorageService.set("token", response.data.token);
					console.log(response.data.token);
					$state.go('home');
				}, function(error) {
					alert(error.data);
				});
		};
	}
})();