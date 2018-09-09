const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Post = require('../Models/Post.js');

const noPostFoundError = 'No post with that id could be found';

module.exports = function(app, { path = '/' } = {}) {
	const router = express.Router();
	router.use(bodyParser.json());
	router.post('/posts/:postId/like', function(req, res) {
		const postId = req.params.postId;
		if (mongoose.Types.ObjectId.isValid(postId) === false) {
			return res.status(404).json({ error: true, message: noPostFoundError });
		}

		Post.findOneAndUpdate({ _id: postId }, { $inc: { likes: 1 } }, { new: true }, function(err, doc) {
			if (err) {
				return res.status(500).json({ error: true, message: 'An internal error has occured' });
			}
			if (!doc) {
				return res.status(404).json({ error: true, message: noPostFoundError });
			}

			return res.status(200).json(doc.toObject());
		});
	});

	app.use(path, router);
};
