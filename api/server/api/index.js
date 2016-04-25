import { Router } from 'express';
import _ from 'lodash';
const Promise = require('bluebird');
const async = require('async');
const inspect = require('eyes').inspector();

import SlackApi from '../../modules/SlackApi'
const authSlack = new SlackApi();

let slackClient;

export default function() {
	const api = Router();

	api.post('/auth/slack/callback', (req, res) => {
		/**
		 * POST from client with code param included from redirect after successful auth from slack login
 		 * @type {{client_id: string, client_secret: string, code: *}}
         */
		const opts = {
			client_id: '2165302478.32002522884',
			client_secret: '8b37b0b6095d6c288987554ea5196152',
			code: req.body.code
		};

		authSlack.getApi('oauth.access', opts, (err, data) => res.redirect('/api/unread?token=' + data.access_token))
	});

	api.get('/unread', (req, res) => {

		inspect(req.query.token, 'req.query.token:');

		/**
		 * 1. first get all data returned from rtm.start
		 * 2. transform the data into custom structure by adding unread messages to each channel/group/im/mpim
		 * 3. fetch users.list so we can show user name/profile image
		 * 4. send custom unreads object to the client
		 */

		const token = req.query.token;
		slackClient = new SlackApi(token);

		let promises = [];
		let unreads = { channels: [], groups: [], im: [], mpim: [], users: [] };

		async.waterfall([
			function (callback) {

				slackClient.getApi('rtm.start', {mpim_aware: true}, function (err, response) {

					if (!response || !response.ok || !_.isEmpty(err)) {
						inspect(err, 'err rtm.start:');
						return res.json({
							msg: 'fail',
							error: response && response.error || (err && err.message) ||  'error'
						});
					}

					const channelsUnread = _.reduce(response.channels, (seed, channel) => {
						if (!channel.is_archived && channel.unread_count) {
							if (channel.unread_count > 0) {
								unreads.channels.push(channel);
							}
							seed += channel.unread_count;
						}
						return seed

					}, 0);

					const groupsUnread = _.reduce(response.groups, (seed, group) => {
						if (!group.is_archived && group.unread_count) {
							if (group.unread_count > 0) {
								unreads.groups.push(group);
							}
							seed += group.unread_count;
						}
						return seed
					}, 0);

					const imsUnread = _.reduce(response.ims, (seed, im) => {
						if (im.unread_count > 0) {
							unreads.im.push(im);
						}
						seed += im.unread_count;
						return seed
					}, 0);

					const mpimsUnread = _.reduce(response.mpims, (seed, im) => {
						if (+im.unread_count > 0 && !im.is_archived) {
							unreads.mpim.push(im);
						}
						seed += im.unread_count;
						return seed
					}, 0);

					const total = channelsUnread + groupsUnread + imsUnread + mpimsUnread;

					inspect(total, 'total');

					callback(null, {
						token: req.query.token,
						total: total,
						messages: unreads,
						user: _.pick(response.self, ['name', 'id', 'profile'])
					})
				});
			},
			function (unreadsObj, callback) {
				_.each(unreadsObj.messages, (kinds, key) => {
					/**
					 * iterate over each unreads.messages.channels, unreads.messages.groups etc..
					 */
					_.each(kinds, kind => {
						/**
                         * get the message history for each channel type. `kind` will be 'channel', 'group', 'im', or 'mpim'
						 */
						const historyPromise = slackClient.getHistory(req.query.token, kind.id, key, kind.last_read).then(h => {
							_.extend(_.find(unreads[key], {id: kind.id}), { JakesMessages: h });
							return h
						}, (err) => inspect(err, 'err getHistory'));

						promises.push(historyPromise);
					});
				});

				Promise.all(promises).then(() => callback(null, unreadsObj));
			},
			function (unreadsWithHistory, callback) {
				/**
				 * unreadsWithHistory now includes channel objects with history
				 * return array of users so client can map the names/profile images
				 */
				slackClient.getUsers(req.query.token).then(users => {
					_.extend(unreadsWithHistory, { users: _.filter(users.members, user => !user.deleted) });
					callback(null, unreadsWithHistory);
				}, (err) => inspect(err, 'err getUsers'));
			}

		], function (err, result) {
			/**
			 * pass final unreads object to client
			 	unreads = {
					channels: [...],
					groups: [...],
					im: [...],
					mpim: [...],
					users: [...]
				}
			 */
			inspect(result, 'final result ....');
			return res.json(result)
		});
	});

	api.post('/mark', (req, res) => {
		/**
		 * 1. mark the message as read
		 * 2. after message is marked as read, sync client by returning updated message history
         */
		const opts = { channel: req.body.channelId, ts: req.body.ts };
		let unreads = {channels: [], groups: [], im: [], mpim: []};

		slackClient.getApi(`${req.body.kind}.mark`, opts, (err, data) => {

			if (err || !data || !data.ok){
				return res.json({
					msg: `err marking ${req.body.kind}`,
					error: (err && err.message) || 'error'
				});
			}

			slackClient.getHistory(req.body.token, req.body.channelId, req.body.kind, req.body.ts).then(h => {
				/**
				 * extend the message history object with JakesMessages so the client can parse it
                 */
				unreads[req.body.kind].push(_.extend({id: req.body.channelId}, {JakesMessages: h}));

				return res.json(unreads);

			}, (err) => inspect(err, `err getHistory for ${req.body.kind} #${req.body.channelId}:`));
		});
	});

	return api;
}
