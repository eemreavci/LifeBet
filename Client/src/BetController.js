(function() {
	'use strict';
	angular.module('app')
		   .controller('BetController', BetController);

	function BetController($http)	{
		var vm = this;
		$http.get("/api/bets")
			.then(function(response) {
				vm.bets = response.data;
			});
	}
})();