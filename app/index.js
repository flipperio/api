require('dotenv-safe').config();
const express = require('express');
const mongoose = require('mongoose');
const dbUri = require('./utils/dbUri.js');
const controller = require('./controllers/index.js');

mongoose.connect(dbUri(), function(mongooseErr) {
	if (mongooseErr) {
		throw mongooseErr;
	}

	const app = express();
	controller(app);
	const server = app.listen(process.env.PORT, function() {
		console.log(`Server started on port ${process.env.PORT}`);
	});

	server.on('error', function(serverErr) {
		throw serverErr;
	});
});

mongoose.connection.on('error', function(err) {
	throw err;
});
