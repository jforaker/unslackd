'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	var api = (0, _express.Router)();
	var apiToken = 'xoxp-2165302478-2615484651-32016104352-dd2118e986'; //xoxp-2165302478-2615484651-10996742980-55f05d6e5f

	// mount the facets resource
	//api/facets/0
	api.use('/facets', _facets2.default);

	// perhaps expose some API metadata at the root
	//api/users
	api.get('/unread', function (req, res) {

		var slack = new _slackNode2.default(apiToken);

		//slack.api("users.counts" == good
		slack.api('users.counts', function (err, response) {
			console.log('response.channels', response.channels);
			if (!response.ok || !_lodash2.default.isEmpty(err)) {
				return { msg: 'fail' };
			}

			var channelsUnread = _lodash2.default.reduce(response.channels, function (seed, channel) {
				if (!channel.is_archived) {
					seed += channel.unread_count;
					return seed;
				}
			}, 0);

			var groupsUnread = _lodash2.default.reduce(response.channels, function (seed, group) {
				if (!group.is_archived) {
					seed += group.unread_count;
					return seed;
				}
			}, 0);

			var imsUnread = _lodash2.default.reduce(response.channels, function (seed, im) {
				seed += im.dm_count;
				return seed;
			}, 0);

			//	console.log('channelsUnread, groupsUnread, imsUnread', channelsUnread, groupsUnread, imsUnread);

			res.json({
				channels: response.channels,
				groups: response.groups,
				ims: response.ims
			});
		});
	});

	return api;
};

var _express = require('express');

var _facets = require('./facets');

var _facets2 = _interopRequireDefault(_facets);

var _slackNode = require('slack-node');

var _slackNode2 = _interopRequireDefault(_slackNode);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//# sourceMappingURL=index-compiled.js.map