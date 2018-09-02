const path = require('path');

module.exports = {
	env: {
		node: true,
	},
	extends: [
		'eslint-config-airbnb-base',
		path.resolve(__dirname, 'linting/.eslintrc-chox.js'),
	]
}
