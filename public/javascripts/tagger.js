var socket = io.connect('http://localhost');

var TaggerModule = angular.module('TaggerModule', []);

TaggerModule.controller('TagController', ['$scope', function($scope) {
	$scope.game_started = false;
	$scope.my_tags = [];
	$scope.total_tags = 0;
	$scope.username = '';

	while([undefined, null, ''].indexOf($scope.username) > -1) {
		$scope.username = window.prompt('Enter your email address');
	}

	socket.emit('set_username', {username: $scope.username});

	socket.on('new_user', function(payload) {
		$scope.users = payload.users;
		$scope.$apply();
	});

	socket.on('show_new_product', function(payload) {
		$scope.my_tags = [];
		$scope.total_tags = 0;
		$scope.cur_option = payload.opt;
		$scope.img_url = payload.img_url;
		$scope.$apply();
	});

	socket.on('game_started', function() {
		$scope.game_started = true;
		$scope.$apply();
	});

	socket.on('game_over', function() {
		alert('Game Over');
	});

	socket.on('timer', function(payload) {
		$scope.timer = payload.timer;
		$scope.$apply();
	});

	socket.on('total_tags', function(payload) {
		$scope.total_tags = payload.total_tags;
		$scope.$apply();
	});

	$scope.add_tag = function() {
		socket.emit('tag_suggested', {tag: $scope.tag_name, username: $scope.username});

		$scope.my_tags.push($scope.tag_name);

		$scope.tag_name = undefined;
	};

	$scope.start_game = function() {
		socket.emit('start_game', {});
	};

}]);

TaggerModule.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                        scope.$apply(function(){
                                scope.$eval(attrs.ngEnter);
                        });

                        event.preventDefault();
                }
            });
        };
});