import request from 'superagent'
import Promise from 'bluebird'
import _ from 'lodash'

//const API_URL = 'http://localhost:3000/api';
const API_URL = 'https://unslackd-ubfzzroiai.now.sh/api';
/**
 * err() called by Promise.catch(err)
 * @param err: 'reject' object passed in via handle() function
 */

const err = (err) => {
    console.log('Mega Api err, arguments ', err, arguments);
};

/**
 * handle() called in end() callback of [superagent].request()
 * @param err: error
 * @param res: response
 * @param resolve: Promise.resolve
 * @param reject: Promise.reject
 */

const handle = (err, res, resolve, reject) => {

    if (err && err.status) {
        console.warn(`network err api ${res.req.method}: `, res.req.url, err);
        if (res.status >= 400 && res.status <= 500) {
            resolve({error: res.body || 'error'});
        } else {
            reject(err.status)
        }
    }

    if (res && res.status >= 200 && res.status < 300) {
        console.info(`result handle api call: ${res.req.url}`, res.body);
        if (res.status === 204) return resolve(res); //For successful DELETE requests
        resolve(res.body);

    } else {
        reject({
            status: res && res.status ? res.status : 'unknown api error',
            error: res && res.status ? res.status : 'unknown api error',
            statusText: res && res.body ? res.body : null
        });
    }
};

/**
 * doRequest() master method for making authenticated api requests
 * @param vals
 */

const doRequest = (vals) => {
    /**
     * req()
     * @param args: object that includes 'method', 'url', 'token' and optional 'params'
     */
    const req = (args) => {
        return new Promise((resolve, reject) => {
            return request[args.method](args.url)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(args.params)
                .end(function (err, res) {
                    handle(err, res, resolve, reject)
                });
        })
    };

    return req(vals)
        .then(data => data, err => err)
        .catch(err);
};

const api = {

    user: {

        authSlack: (code) => {

            /**
             * Hit Slack 'oauth.access' with code param from redirect after successful auth from slack login
             * @param code:  ?code=xxxxxx from slack redirect url
             * POST ${API_URL}/auth/slack/callback/
             */

            const data = {
                params: {
                    code: code
                },
                url: `${API_URL}/auth/slack/callback/`,
                method: 'post'
            };

            return doRequest(data);
        },

        getUnreads: (token) => {

            console.log('token client' , token);

            const data = {
                url: `${API_URL}/unread?token=${token}`,
                method: 'get'
            };

            return doRequest(data);
        },

        markAsRead: (token, channel, ts, unreads, kind) => {

            const data = {
                params: {
                    token: token,
                    channelId: channel,
                    ts: ts,
                    unreads: unreads,
                    kind: kind
                },
                url: `${API_URL}/mark`,
                method: 'post'
            };

            return doRequest(data);
        }
    }
};

export default api;
