const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const Post = require('../Models/Post.js');

const defaultPageSize = config.get('query.defaultPageSize');
const maxPageSize = config.get('query.maxPageSize');

module.exports = function(app, { path = '/posts' } = {}) {
	const router = express.Router();

	router.use(bodyParser.json());
	router.get('/', function(req, res) {
		let page = 0;
		let count = defaultPageSize;

		const pageQuery = req.query.page;
		const countQuery = req.query.count;

		if (pageQuery) {
			if (Number.isNaN(Number(pageQuery)) || Number(pageQuery) < 0) {
				return res.status(400).json({
					error: true,
					message: 'Param `page` must be a number greater than or equal to 0'
				});
			}

			page = Math.floor(Number(pageQuery));
		}
		if (countQuery) {
			if (Number.isNaN(Number(countQuery)) || Number(countQuery) < 1 || Number(countQuery) > maxPageSize) {
				return res.status(400).json({
					error: true,
					message: `Param 'count' must be a number greater than or equal to 1 and less than ${maxPageSize}`
				});
			}

			count = Math.floor(Number(countQuery));
		}

		const findOptions = {
			sort: { createdOn: -1 },
			limit: count,
			skip: page * count,
			lean: true
		};
		Post.find({}, null, findOptions, function(err, posts) {
			if (err) {
				return res.status(500).json({ error: true, message: 'An internal error has occured' });
			}

			res.status(200).json(posts);
		});
	});

	app.use(path, router);
};
