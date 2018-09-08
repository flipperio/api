const express = require('express');
const Post = require('../Models/Post.js');

module.exports = function(app, { path = '/posts' } = {}) {
	const router = express.Router();

	router.get('/', function(req, res) {
		Post.find({}, null, { sort: { createdOn: -1 }, limit: 10, lean: true }, function(err, posts) {
			if (err) {
				return res.status(500).json({ error: true, message: 'An internal error has occured' });
			}

			res.status(200).json(posts);
		});
	});

	app.use(path, router);
};
