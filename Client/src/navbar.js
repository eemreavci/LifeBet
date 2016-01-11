(function() {
	'use strict';
	angular.module('navbar', ['authorization', 'LocalStorageModule'])
		.controller('NavbarController', ['$rootScope', '$state', '$http', 'localStorageService', 'authorizationService', NavbarController]);

	function NavbarController($rootScope, $state, $http, localStorageService, authorizationService) {
		var vm = this;
		vm.user = authorizationService.getUser();

		$rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
	        if(fromState.name == "login" || toState.name == "logout")
	        	vm.user = authorizationService.getUser();
	    });       

		vm.isLoggedIn = function() { return authorizationService.isLoggedIn() };

		vm.search = function() {
			$http.post("/api/users/search", {'searchText': vm.searchText}, { headers: {'x-access-token': localStorageService.get('token')} })
				.then(function(response) {
					console.log(response);
					vm.searchResults = response.data.result;
				});
		}
	}

})();