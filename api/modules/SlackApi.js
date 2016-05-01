const inspect = require('eyes').inspector();
import Slack from 'slack-node';
const Promise = require('bluebird');

export default class SlackApi {

    //wrapper for slack-node
    constructor(token){
        this.token = token;
        this.Slackr = new Slack(this.token);

        this.getApi = (method, options, callback) => {
            this.Slackr.api(method, options, callback);
        };

        this.getUsers = (token) => {
            return new Promise((resolve, reject) => {
                return this.getApi('users.list', {token}, (err, data) => {
                    if (err) {
                        console.log(err);
                        reject(err)
                    }
                    return resolve(data)
                })
            })
        };

        this.getHistory = (token, channel, kind, last_read) => {
            return new Promise((resolve, reject) => {
                return this.getApi(`${kind}.history`, {oldest: last_read, token, channel}, (err, data) => {
                    if (err) {
                        console.log(err);
                        reject(err)
                    }
                    return resolve(data)
                })
            })
        };
    }
};
