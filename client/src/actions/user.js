const store = require('react-native-simple-store');

import _ from 'lodash'
import api from '../utils/api'

export const SET_TOKEN = 'SET_TOKEN';
export const GET_UNREADS_SUCCESS = 'GET_UNREADS_SUCCESS';
export const GET_UNREADS_ERROR = 'GET_UNREADS_ERROR';
export const UNREADS_LOADING = 'UNREADS_LOADING';
export const CLEAR_TOKEN = 'CLEAR_TOKEN';
export const UNREADS_REFRESHING = 'UNREADS_REFRESHING';

export function setToken(token) {
    return {
        type: SET_TOKEN, token: token
    };
}

export function doLogout() {
    store.delete('token');
    return {type: CLEAR_TOKEN, token: null}
}

export function authSlackError(response) {
    console.log('authSlackError err' , response);
    return dispatch => {
        dispatch({type: GET_UNREADS_ERROR, response});
    };
}

export function authSlackSuccess(response) {
    console.log('response authSlackSuccess' , response);
    store.save('token', response.token);
    return dispatch => {
        dispatch({type: GET_UNREADS_SUCCESS, response});
    };
}

export function authSlack(code) {
    return dispatch => {
        return api.user.authSlack(code).then(response => {
            if (!response.error) {
                return dispatch(authSlackSuccess(response));
            } else {
                return dispatch(authSlackError(response.error));
            }
        })
    };
}

export function getUnreadsError(response) {
    return dispatch => {
        dispatch({type: GET_UNREADS_ERROR, response});
    };
}

export function getUnreadsSuccess(response) {
    console.log('response getUnreadsSuccess', response);
    return dispatch => {
        dispatch({type: GET_UNREADS_SUCCESS, response});
        dispatch(unreadsLoading(false));
    };
}

export function unreadsLoading(tf) {
    return dispatch => {
        dispatch({type: UNREADS_LOADING, unreads_loading: tf});
    };
}

export function getUnreads(token, setLoading) {
    return dispatch => {
        dispatch(unreadsLoading(setLoading));
        return api.user.getUnreads(token).then(response => {
            if (!response.error) {
                dispatch(getUnreadsSuccess(response));
                return response
            } else {
                return dispatch(getUnreadsError(response.error));
            }
        })
    };
}

export function refreshUnreads(response, unreads, kind, channel){

    function newTotal(unreadClone) {

        const channelsUnread = _.reduce(unreadClone.channels, (seed, channel) => {
            seed += +channel.JakesMessages.messages.length;
            return +seed;
        }, 0);

        const groupsUnread = _.reduce(unreadClone.groups, (seed, channel) => {
            seed += +channel.JakesMessages.messages.length;
            return +seed;
        }, 0);

        const imsUnread = _.reduce(unreadClone.im, (seed, channel) => {
            seed += +channel.JakesMessages.messages.length;
            return +seed;
        }, 0);

        const mpimsUnread = _.reduce(unreadClone.mpim, (seed, channel) => {
            seed += +channel.JakesMessages.messages.length;
            return +seed;
        }, 0);

        const total = channelsUnread + groupsUnread + imsUnread + mpimsUnread;
        console.log('total new total', total);
        return total;
    }

    let clone = _.assign({}, unreads);
    const channelOb = _.find(clone.messages[kind], {id: channel});
    const msg = _.find(response[kind], {id: channel});

    _.extend(channelOb.JakesMessages, msg.JakesMessages);

    clone.total = newTotal(clone.messages);

    return dispatch => {
        dispatch(unreadsRefreshing(false));
        dispatch({type: GET_UNREADS_SUCCESS, response: clone});
    };
}

export function unreadsRefreshing(tf){
    return dispatch => {
        dispatch({type: UNREADS_REFRESHING, unreads_refreshing: tf});
    };
}

export function markAsRead(token, channel, ts, unreads, rowData) {

    return dispatch => {
        dispatch(unreadsRefreshing(true));
        return api.user.markAsRead(token, channel, ts, unreads, rowData.type).then(response => {
            if (!response.error) {
                console.log('response markAs Read...' , response);
                dispatch(refreshUnreads(response, unreads, rowData.type, channel));

            } else {
                return dispatch({type:null});
            }
        })
    };
}