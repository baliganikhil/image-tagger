module.exports = function(server) {
	var io = require('socket.io')(server);
	var mongoose = require('mongoose');
	var Tag = require('./models/tag');

	var options = [
		'10303003101',
		'10292000401',
	];

	var tag_map = {};
	options.forEach(function(opt) {
		tag_map[opt] = {};
	});

	var opt_ptr = 0;
	var game_started = false;
	var game_over = false;
	var timer = 20;
	var total_tags = 0;
	var timer_handle = '';
	var users = {};

	io.sockets.on('connection', function(socket) {

		show_new_product();

		if (game_started) {
			socket.emit('game_started', {});
		}

		function show_new_product() {
			if (opt_ptr == options.length) {
				game_over = true;
				io.emit('game_over');
				clearInterval(timer_handle);
				return;
			}

			var option = options[opt_ptr];
			var payload = {opt: option, img_url: get_img_url(option)};

			socket.emit('show_new_product', payload);
			socket.broadcast.emit('show_new_product', payload);
		}

		socket.on('tag_suggested', function(payload) {
			if (game_over) {
				socket.emit('game_over', {});
				return;
			}

			if (tag_map[options[opt_ptr]][payload.tag] == undefined) {
				tag_map[options[opt_ptr]][payload.tag] = 1;
			} else {
				tag_map[options[opt_ptr]][payload.tag] += 1;
			}

			total_tags += 1;

			users[payload.username] += 1;

			io.emit('total_tags', {total_tags: total_tags});
			io.emit('new_user', {users: users});

			console.log(tag_map);
		});

		socket.on('set_username', function(payload) {
			var username = payload.username;
			if (!users.hasOwnProperty(username)) {
				users[username] = 0;
			}

			io.emit('new_user', {users: users});
		});

		socket.on('start_game', function() {
			game_started = true;
			socket.emit('game_started', {});
			socket.broadcast.emit('game_started', {});

			timer_handle = setInterval(function() {
				io.emit('timer', {timer: timer});

				if (timer == 0) {
					timer = 20;
					save_tags()
					opt_ptr += 1;
					show_new_product();
				} else {
					timer -= 1;
				}

			}, 1000);
		});

		function save_tags() {
			for (tag in tag_map[options[opt_ptr]]) {
				(new Tag({
					opt: options[opt_ptr],
					tag: tag,
					count: tag_map[options[opt_ptr]][tag]
				})).save(function(err, doc) {
					if (err) {
						console.log('Cou;d not save');
						return;
					}

					console.log('saved');
				});
			}
		}

	});
};

function get_img_url(opt) {
	// return opt;
	return "http://d1n7si5t7mlegv.cloudfront.net/z/prod/w/2/g/p/" + opt + "/1_d.jpg";
}