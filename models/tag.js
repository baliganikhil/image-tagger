var mongoose = require('mongoose');

var Tag = mongoose.Schema({
	opt: String,
	tag: String,
	count: Number
});

module.exports = mongoose.model('Tag', Tag);