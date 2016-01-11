(function() {
	'use strict';
	angular.module('controller.profile', ['LocalStorageModule', 'authorization', 'ngFileUpload'])
		   .controller('ProfileController', ['$http', 'localStorageService', 'authorizationService', '$state', '$stateParams', 'Upload', ProfileController]);

	function ProfileController($http, localStorageService, authorizationService, $state, $stateParams, Upload)	{
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

		vm.upload = function (file) {
			// $http.post("/api/user/profile/image", $.param({'image': file}), { headers: {'x-access-token': localStorageService.get('token'), 'Content-Type': 'application/x-www-form-urlencoded'} })
			// 	.then(function(response) {
			// 		console.log(response);
			// 	});
				// Upload.http({
				// 	url: '/api/user/profile/image',
				// 	headers : {
				// 		'Content-Type': 'application/x-www-form-urlencoded',
				// 		'x-access-token': localStorageService.get('token')
				// 	},
				// 	data: file
				// })
	        Upload.upload({
	            url: '/api/user/profile/image',
	            data: {'image': file},
	            headers: {'x-access-token': localStorageService.get('token')}
	        }).then(function (resp) {
	            console.log('Response: ' + resp);
	            vm.currentUser.profilePicturePath = resp.data.profilePicturePath;
	        }, function (resp) {
	            console.log('Error status: ' + resp.status);
	        }, function (evt) {
	            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	            console.log('progress: ' + progressPercentage + '% ');
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
					vm.checkIfFriend();
					console.log(response);
				});
		};

		vm.removeFriend = function() {
			$http.delete("/api/user/friends/" + vm.user_id, { headers: {'x-access-token': localStorageService.get('token')} })
				.then(function(response) {
					vm.checkIfFriend();
					console.log(response);
				});
		};

		vm.checkIfFriend = function() {
			$http.get("/api/user/friends/", { headers: {'x-access-token': localStorageService.get('token')} })
				.then(function(response) {
					var found = (_.find(response.data.friends, function(friend) { return friend._id == vm.user_id; }));
					vm.isFriend = (typeof found == "object" || vm.user_id == vm.currentUser._id);
					vm.isCurrentUser = (vm.user_id == vm.currentUser._id);
				});
		};

		vm.getProfile();
		vm.getUserBets();
		vm.checkIfFriend();
	}
})();