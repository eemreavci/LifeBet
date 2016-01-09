(function() {
	'use strict';
	angular.module('controller.bet', ['LocalStorageModule'])
		   .controller('BetController', ['$http', 'localStorageService', BetController]);

	function BetController($http, localStorageService)	{
		var vm = this;
		vm.commentContent = "";
		console.log(localStorageService);
		
		
		vm.getBets = function() {
			$http.get("/api/bets", { headers: {'x-access-token': localStorageService.get('token')} })
				.then(function(response) {
					vm.bets = response.data;
				});
		};

		vm.postComment = function(bet) {
			$http.post("/api/bets/" + bet._id + "/comments", {'content': vm.commentContent}, { headers: {'x-access-token': localStorageService.get('token')} })
				.then(function(response) {
					console.log(response);
					bet.comments.push(response.data.comment);
				});
			
		};

		vm.getBets();
	}
})();