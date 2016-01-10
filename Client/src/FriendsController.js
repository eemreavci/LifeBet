(function() {
	'use strict';
	angular.module('controller.friends', ['LocalStorageModule'])
		   .controller('FriendsController', ['$http', 'localStorageService', FriendsController]);

	function FriendsController($http, localStorageService)	{
		var vm = this;
		
		vm.getFriends = function() {
			$http.get("/api/user/friends", { headers: {'x-access-token': localStorageService.get('token')} })
				.then(function(response) {
					vm.friends = response.data.friends;
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
		
		vm.getFriends();
	}
})();