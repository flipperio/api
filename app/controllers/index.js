const express = require('express');
const cors = require('cors');

module.exports = function controller(app, { path='/api' } = {}) {
	const router = express.Router();

	if(process.env.NODE_ENV !== 'production') {
		router.use(cors());
		router.options('*', cors());
	}

	router.get('/ping', function(req, res) {
		res.status(200).send('pong');
	});

	app.use(path, [router]);
}
