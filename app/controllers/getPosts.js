const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const Post = require('../../Models/Post.js');

const defaultPageSize = config.get('query.defaultPageSize');
const maxPageSize = config.get('query.maxPageSize');

function respondError(res, status, message) {
	res.status(status).json({ error: true, message });
}

function validatePageQuery(pageQuery) {
	if (Number.isNaN(Number(pageQuery)) || Number(pageQuery) < 0) {
		return { error: true, message: 'Param `page` must be a number greater than or equal to 0' };
	}
}

function validateCountQuery(countQuery) {
	if (Number.isNaN(Number(countQuery)) || Number(countQuery) < 1 || Number(countQuery) > maxPageSize) {
		return {
			error: true,
			message: `Param 'count' must be a number greater than or equal to 1 and less than ${maxPageSize}`
		};
	}
}

function generatePagingSortOptions(page, count) {
	return {
		sort: { createdOn: -1 },
		limit: count,
		skip: page * count
	};
}

function getPosts(req, res) {
	let page = 0;
	let count = defaultPageSize;

	const pageQuery = req.query.page;
	const countQuery = req.query.count;

	if (pageQuery) {
		const pageQueryError = validatePageQuery(pageQuery);
		if (pageQueryError) {
			return res.status(400).json(pageQueryError);
		}
		page = Math.floor(Number(pageQuery));
	}
	if (countQuery) {
		const countQueryError = validateCountQuery(countQuery);
		if (countQueryError) {
			return res.status(400).json(countQueryError);
		}
		count = Math.floor(Number(countQuery));
	}

	Post.find({}, null, generatePagingSortOptions(page, count), function(err, posts) {
		if (err) {
			return res.status(500).json({ error: true, message: 'An internal error has occurred' });
		}

		res.status(200).json(posts);
	});
}

function getPost(req, res) {
	return res.status(200).json(req.post);
}

function getParent(req, res) {
	if (!req.post.parent) {
		return respondError(res, 404, 'This post does not have a parent');
	}

	Post.findOne({ _id: req.post.parent }).exec(function(err, parent) {
		if (err) {
			return respondError(res, 500, 'An internal error has occurred');
		}

		if (!parent) {
			return respondError(res, 404, 'No parent could be found for this post');
		}

		return res.status(200).json(parent);
	});
}

function getReplies(req, res) {
	let page = 0;
	let count = defaultPageSize;

	const pageQuery = req.query.page;
	const countQuery = req.query.count;

	if (pageQuery) {
		const pageQueryError = validatePageQuery(pageQuery);
		if (pageQueryError) {
			return res.status(400).json(pageQueryError);
		}
		page = Math.floor(Number(pageQuery));
	}
	if (countQuery) {
		const countQueryError = validateCountQuery(countQuery);
		if (countQueryError) {
			return res.status(400).json(countQueryError);
		}
		count = Math.floor(Number(countQuery));
	}

	Post.find({ parent: req.post._id }, null, generatePagingSortOptions(page, count)).exec(function(err, replies) {
		if (err) {
			return respondError(res, 500, 'An internal error has occurred');
		}

		res.status(200).json(replies);
	});
}

function resolvePostId(req, res, next) {
	const postId = req.params.postId;
	const notFoundMessage = `A post with id ${postId} could not be found`;

	if (mongoose.Types.ObjectId.isValid(postId) === false) {
		return respondError(res, 404, notFoundMessage);
	}


	Post.findOne({ _id: postId }).exec(function(err, post) {
		if (err) {
			return respondError(res, 500, 'An internal error has occurred');
		}

		if (!post) {
			return respondError(res, 404, notFoundMessage);
		}

		req.post = post;
		next();
	});
}

module.exports = function(app, { path = '/posts' } = {}) {
	const router = express.Router();

	router.get('/', getPosts);
	router.route('/:postId')
	.get(resolvePostId)
	.get('/', getPost)
	.get('/parent', getParent)
	.get('/replies', getReplies);

	app.use(path, router);
};
