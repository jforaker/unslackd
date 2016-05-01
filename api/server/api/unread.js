import _ from 'lodash';
const Promise = require('bluebird');
const async = require('async');
const inspect = require('eyes').inspector();
import SlackApi from '../../modules/SlackApi'

let slackClient;

export default function(req, res) {

    inspect(req.query.token, 'UNREAD req.query.token:');

    /**
     * 1. first get all data returned from rtm.start
     * 2. transform the data into custom structure by adding unread messages to each channel/group/im/mpim
     * 3. fetch users.list so we can show user name/profile image
     * 4. send custom unreads object to the client
     */

    let promises = [];
    let unreads = {channels: [], groups: [], im: [], mpim: [], users: []};
    const token = req.query.token;
    slackClient = new SlackApi(token);

    async.waterfall([
        function (callback) {

            slackClient.getApi('rtm.start', {mpim_aware: true}, function (err, response) {

                if (!response || !response.ok || !_.isEmpty(err)) {
                    inspect(err, 'err rtm.start:');
                    return res.json({
                        msg: 'rtm.start fail',
                        error: response && response.error || (err && err.message) || 'error'
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

                    const historyPromise = slackClient.getHistory(req.query.token, kind.id, key, kind.last_read).then(history => {
                        const channelToFind = _.find(unreads[key], {id: kind.id});
                        _.extend(channelToFind, { JakesMessages: history });
                        return history
                    }, (err) => inspect(err, 'err getHistory'));

                    promises.push(historyPromise);
                });
            });

            Promise.all(promises).then(() => callback(null, unreadsObj));
        },
        function (unreadsWithHistory, callback) {
            /**
             * unreadsWithHistory now includes channel objects with history
             * return array of (current / non deleted) users so client can map the names/profile images
             */
            slackClient.getUsers(req.query.token).then(users => {
                _.extend(unreadsWithHistory, {users: _.filter(users.members, user => !user.deleted)});
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

        if (!result || !_.isEmpty(err)) {
            inspect(err, 'err async.waterfall:');
            return res.json({
                msg: 'async.waterfall fail',
                error: result && result.error || (err && err.message) || 'error'
            });
        }

        //inspect(result, 'final result ....');

        return res.json(result)
    });
}