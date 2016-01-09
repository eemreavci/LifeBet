(function() {
	'use strict';
	angular.module('authorization', ['ui.router', 'LocalStorageModule'])
		.config(function($stateProvider) {
			$stateProvider.state('login', {
				url: '/login',
				controller: 'LoginController',
				templateUrl: 'pages/login.html',
				loginRequired: false
			});
			$stateProvider.state('logout', {
				url: '/logout',
				controller: 'LogoutController',
				loginRequired: true
			});
		})
		.service('authorizationService', ['$http', '$state', 'localStorageService', authorizationService])
		.controller('LoginController', ['authorizationService', LoginController])
		.controller('LogoutController', ['authorizationService', LogoutController]);

	function authorizationService($http, $state, localStorageService) {
		var vm = this;
		vm.currentUser = {};
		vm.login = function(email, password) {
			$http.post("/api/login", {email: email, password: password})
				.then(function(response) {
					if(response.data.success) {
						localStorageService.set("token", response.data.token);
						localStorageService.set("user", response.data.user);
						vm.currentUser = response.data.user;
						console.log(response.data.user);
						$state.go('home');
					}
					else {
						alert('Wrong email/password');
						console.log(response.data);
					}
				}, function(error) {
					alert(error.data);
				});
		};
		vm.logout = function() {
			localStorageService.remove("token");
			$state.go('login');
		}
		vm.getUser = function() {
			if(_.isEmpty(vm.currentUser))
				vm.currentUser = localStorageService.get('user');
			return vm.currentUser;
			
		}
	}

	function LoginController(authorizationService) {
		var vm = this;
		vm.login = function() { authorizationService.login(vm.email, vm.password) };;
	}

	function LogoutController(authorizationService)	{
		authorizationService.logout();
	}
})();