import { Router } from 'express';
import Slack from 'slack-node';
import _ from 'lodash';
const Promise = require('bluebird');
const async = require('async');
const inspect = require('eyes').inspector();

let slack = new Slack();

export default function() {
	const api = Router();

	//callback from oAuth success: api/slack/login
	api.post('/auth/slack/callback', (req, res) => {

		//http://localhost:8080/api/auth/slack/callback?code=2165302478.34500611943.73e75c94f7&state=0.8017245386727154
		const opts = {
			client_id: '2165302478.32002522884',
			client_secret: '8b37b0b6095d6c288987554ea5196152',
			code: req.body.code
		};

		slack.api('oauth.access', opts, (err, data) => res.redirect('/api/unread?token=' + data.access_token))
	});

	const getPerson = (token, user, callback) => {
		const slack = new Slack(token);

		return new Promise((resolve, reject) => {
			return slack.api('users.info', {token, user}, (err, data) => {
				if (err) {
					console.log(err);
					reject(err)
				}
				//inspect(data.user, 'user data');
				return resolve(callback(data.user))
			})
		})
	};

	const getHistory = (token, channel, kind, last_read) => {
		const slack = new Slack(token);

		return new Promise((resolve, reject) => {
			return slack.api(`${kind}.history`, {oldest: last_read, token, channel}, (err, data) => {
				if (err) { console.log(err); reject(err)}
				inspect(data, `${kind}.history`);
				return resolve(data)
			})
		})
	};

	api.get('/unread', (req, res) => {

		inspect(req.query.token, 'req.query.token foo bar');

		const token = req.query.token;
		const slack = new Slack(token);

		let promises = [];

		let unreads = {
			channels: [],
			groups: [],
			im: [],
			mpim: []
		};

		async.waterfall([
			function (callback) {
				slack.api('rtm.start', {mpim_aware: true}, function (err, response) {

					if (!response || !response.ok || !_.isEmpty(err)) {
						return res.json({
							msg: 'fail',
							error: response && response.error || 'error'
						});
					}

					const channelsUnread = _.reduce(response.channels, (seed, channel) => {
						if (!channel.is_archived && channel.unread_count) {
							if (+channel.unread_count > 0) {
								//inspect(channel.name, 'channels has unreads');
								unreads.channels.push(channel);
							}
							seed += +channel.unread_count;
						}
						return +seed

					}, 0);

					const groupsUnread = _.reduce(response.groups, (seed, group) => {
						if (!group.is_archived && group.unread_count) {
							if (+group.unread_count > 0) {
								//inspect(group.name, 'groups has unreads');
								unreads.groups.push(group);
							}
							seed += +group.unread_count;
						}
						return +seed
					}, 0);

					const imsUnread = _.reduce(response.ims, (seed, im) => {
						if (+im.unread_count > 0) {
							//inspect(im, ' has unreads from ');
							unreads.im.push(im);
						}
						seed += +im.unread_count;
						return +seed
					}, 0);

					const mpimsUnread = _.reduce(response.mpims, (seed, im) => {
						if (+im.unread_count > 0 && !im.is_archived) {
							//inspect(im, ' has unreads from ');
							unreads.mpim.push(im);
						}
						seed += +im.unread_count;
						return +seed
					}, 0);


					const total = channelsUnread + groupsUnread + imsUnread + mpimsUnread;

					inspect(total, 'total');

					callback(null, {
						token: req.query.token,
						total: total,
						messages: unreads,
						user: _.pick(response.self, ['name', 'id'])
					})
				});
			},
			function (unreadsObj, callback) {
				// unreads now equals {unreads} and arg2 now equals 'two'

				_.each(unreadsObj.messages, (kinds, key) => {

					//console.log('kinds', kinds);
					console.log('key', key);

					_.each(kinds, kind => {

						inspect(kind, 'kind');

						const historyPromise = getHistory(req.query.token, kind.id, key, kind.last_read).then(h => {
							const groupToFind = _.find(unreads[key], {id: kind.id});
							_.extend(groupToFind, {JakesMessages: h});
							return h
						});
						promises.push(historyPromise);
					});
				});

				Promise.all(promises).then(function (data) {
					//inspect(data , 'data promises');
					callback(null, unreadsObj)
				});

			}
		], function (err, result) {
			// result now equals 'done'

			inspect(result, 'result ....');

			return res.json(result)
		});

	});

	api.post('/mark', (req, res) => {

		const opts = {
			channel: req.body.channel,
			ts: req.body.ts
		};

		inspect(opts, 'opts');

		const slack = new Slack(req.body.token);

		slack.api('channels.mark', opts, (err, data) => res.json({response: data}))
	});

	return api;
}
