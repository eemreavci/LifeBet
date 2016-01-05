(function() {
	'use strict';
	angular.module('controller.bet', ['LocalStorageModule'])
		   .controller('BetController', ['$http', 'localStorageService', BetController]);

	function BetController($http, localStorageService)	{
		var vm = this;
		console.log(localStorageService);
		$http.get("/api/bets", { headers: {'x-access-token': localStorageService.get('token')} })
			.then(function(response) {
				vm.bets = response.data;
			});
	}
})();