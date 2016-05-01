const inspect = require('eyes').inspector();
import _ from 'lodash';
import SlackApi from '../../modules/SlackApi'
import slack from 'slack'

const authSlack = new SlackApi();

export default function(req, res){

    /**
     * POST from client with code param included from redirect after successful auth from slack login
     * @type {{client_id: string, client_secret: string, code: *}}
     */

    const opts = {
        client_id: '2165302478.32002522884',
        client_secret: '8b37b0b6095d6c288987554ea5196152',
        code: req.body.code
    };

    authSlack.getApi('oauth.access', opts, (err, response) => {

        if (!response || !response.ok || !_.isEmpty(err)) {
            inspect(err, 'err oauth.access:');
            return res.json({
                msg: 'fail',
                error: response && response.error || (err && err.message) || 'error'
            });
        }

        res.redirect('/api/unread?token=' + response.access_token)
    })
}