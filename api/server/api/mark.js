import _ from 'lodash';
const inspect = require('eyes').inspector();
import SlackApi from '../../modules/SlackApi'

let slackClient;

export default function(req, res){
    /**
     * 1. mark the message as read
     * 2. after message is marked as read, sync client by returning updated message history
     */

    const token = req.body.unreads.token;
    slackClient = new SlackApi(token);

    const opts = {channel: req.body.channelId, ts: req.body.ts};
    let unreads = {channels: [], groups: [], im: [], mpim: []};

    slackClient.getApi(`${req.body.kind}.mark`, opts, (err, data) => {

        if (err || !data || !data.ok) {
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
}