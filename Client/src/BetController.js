(function() {
	'use strict';
	angular.module('controller.bet', ['LocalStorageModule'])
		   .controller('BetController', ['$http', 'localStorageService', BetController]);

	function BetController($http, localStorageService)	{
		var vm = this;
		vm.commentContent = [];
		console.log(localStorageService);
		
		
		vm.getBets = function() {
			$http.get("/api/bets", { headers: {'x-access-token': localStorageService.get('token')} })
				.then(function(response) {
					vm.bets = response.data;
				});
		};

		vm.postComment = function(bet) {
			$http.post("/api/bets/" + bet._id + "/comments", {'content': vm.commentContent[bet._id]}, { headers: {'x-access-token': localStorageService.get('token')} })
				.then(function(response) {
					console.log(response);
					bet.comments.push(response.data.comment);
					vm.commentContent[bet._id] = "";
				});
			
		};

		vm.postBet = function() {
			$http.post("/api/bets", {'content': vm.betContent, 'deadline': vm.betDeadline}, { headers: {'x-access-token': localStorageService.get('token')} })
				.then(function(response) {
					console.log(response);
					vm.betContent = "";
					vm.betDeadline = "";
					vm.getBets();
				});
			
		};

		vm.getBets();
	}
})();