(function() {
	'use strict';
	angular.module('controller.profile', ['LocalStorageModule', 'authorization'])
		   .controller('ProfileController', ['$http', 'localStorageService', 'authorizationService', '$state', '$stateParams', ProfileController]);

	function ProfileController($http, localStorageService, authorizationService, $state, $stateParams)	{
		var vm = this;
		vm.user_id = $stateParams.user_id;
		vm.currentUser = authorizationService.getUser();
		console.log(vm.user_id);
		
		
		vm.getProfile = function() {
			$http.get("/api/users/" + vm.user_id, { headers: {'x-access-token': localStorageService.get('token')} })
				.then(function(response) {
					vm.user = response.data.user;
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

		vm.getUserBets = function() {
			$http.get("/api/users/" + vm.user_id + "/bets", { headers: {'x-access-token': localStorageService.get('token')} })
				.then(function(response) {
					vm.userBets = response.data;
				});
		};

		vm.addFriend = function() {
			$http.post("/api/user/friends/", {'friend': vm.user_id}, { headers: {'x-access-token': localStorageService.get('token')} })
				.then(function(response) {
					console.log(response);
				});
		};

		vm.checkIfFriend = function() {
			$http.get("/api/user/friends/", { headers: {'x-access-token': localStorageService.get('token')} })
				.then(function(response) {
					var found = (_.find(response.data.friends, function(friend) { return friend._id == vm.user_id; }));
					vm.isFriend = (typeof found == "object" || vm.user_id == vm.currentUser._id);
				});
		};

		vm.getProfile();
		vm.getUserBets();
		vm.checkIfFriend();
	}
})();