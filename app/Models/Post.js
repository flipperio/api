const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
	title: String,
	body: String,
	likes: { type: Number, default: 0 },
	createdOn: { type: Date, default: Date.now },
	parent: { type: mongoose.Schema.Types.ObjectId, Ref: 'Post' },
	replies: { type: Number, default: 0 }
});

module.exports = mongoose.model('Post', postSchema);
