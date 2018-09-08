const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const Post = require('../Models/Post.js');

const titleConfig = config.get('input.title');
const bodyConfig = config.get('input.body');
function inputSizeError(inputName, min, max) {
	return `Param "${inputName}" must be longer than ${min} chars and less than ${max} chars`;
}

module.exports = function(app, { path = '/posts' } = {}) {
	const router = express.Router();
	router.use(bodyParser.json());
	router.post('/', function(req, res) {
		const title = req.body.title;
		const body = req.body.body;

		if (!title || !body || typeof title !== 'string' || typeof body !== 'string') {
			return res.status(400).json({
				error: true,
				message: 'Params `title` and `body` must both be passed and be non empty strings'
			});
		}

		if (title.length < titleConfig.min || title.length > titleConfig.max) {
			return res.status(400).json({
				error: true,
				message: inputSizeError('title', titleConfig.min, titleConfig.max)
			});
		}
		if (body.length < bodyConfig.min || body.length > bodyConfig.max) {
			return res.status(400).json({
				error: true,
				message: inputSizeError('body', bodyConfig.min, bodyConfig.max)
			});
		}

		Post.create({ title, body }, function(err, createdPost) {
			if (err) {
				return res.status(500).json({
					error: true,
					message: 'An internal error has occured'
				});
			}

			return res.status(200).json(createdPost.toObject());
		});
	});

	app.use(path, router);
};
