(function() {
	'use strict';
	angular.module('navbar', ['authorization', 'LocalStorageModule'])
		.controller('NavbarController', ['authorizationService', NavbarController]);

	function NavbarController(authorizationService) {
		var vm = this;
		vm.user = authorizationService.getUser();

	}

})();