const express = require('express');
const cors = require('cors');
const getPosts = require('./getPosts.js');
require('../Models/Post.js');

module.exports = function controller(app, { path = '/api' } = {}) {
	const router = express.Router();

	if (process.env.NODE_ENV !== 'production') {
		router.use(cors());
		router.options('*', cors());
	}

	router.get('/ping', function(req, res) {
		res.status(200).send('pong');
	});

	getPosts(router);

	app.use(path, router);
};
