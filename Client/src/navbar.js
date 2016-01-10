(function() {
	'use strict';
	angular.module('navbar', ['authorization', 'LocalStorageModule'])
		.controller('NavbarController', ['$http', 'localStorageService', 'authorizationService', NavbarController]);

	function NavbarController($http, localStorageService, authorizationService) {
		var vm = this;
		vm.user = authorizationService.getUser();

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