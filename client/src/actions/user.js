const store = require('react-native-simple-store');

import api from '../utils/api'

export const SET_TOKEN = 'SET_TOKEN';
export const GET_UNREADS_SUCCESS = 'GET_UNREADS_SUCCESS';
export const GET_UNREADS_ERROR = 'GET_UNREADS_ERROR';
export const UNREADS_LOADING = 'UNREADS_LOADING';

export function setToken(token) {
    return {
        type: SET_TOKEN, token: token
    };
}

export function authSlackError(response) {

    return dispatch => {
        dispatch({type: GET_UNREADS_ERROR, response});
    };
}

export function authSlackSuccess(response) {

    console.log('response authSlackSuccess' , response);

    const save = (toke) => {
        store.save('token', toke)
    };

    save(response.token);

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

export function getUnreads(code, setLoading) {

    return dispatch => {
        dispatch(unreadsLoading(setLoading));
        return api.user.getUnreads(code).then(response => {
            if (!response.error) {
                dispatch(getUnreadsSuccess(response));
                return response
            } else {
                return dispatch(getUnreadsError(response.error));
            }
        })
    };
}

export function markAsRead(token, channel, ts) {

    return dispatch => {
        return api.user.markAsRead(token, channel, ts).then(response => {
            if (!response.error) {
                dispatch(getUnreadsSuccess(response));
                return response
            } else {
                return dispatch({type:null});
            }
        })
    };
}