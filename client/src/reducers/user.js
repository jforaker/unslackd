import {
    SET_TOKEN,
    CLEAR_TOKEN,
    GET_UNREADS_SUCCESS,
    UNREADS_LOADING,
    UNREADS_REFRESHING
} from '../actions/user';

let initialState = {
    token: null,
    logged_in: false,
    logging_out: false,
    unreads_loading: false,
    unreads_refreshing: false,
    unreads: {}
};

export default function user(state = initialState, action) {

    switch (action.type) {

        case SET_TOKEN:
            return {
                ...state,
                token: action.token,
                logged_in: true
            };

        case CLEAR_TOKEN:
            return {
                ...state,
                token: null,
                logged_in: false,
                logging_out: true
            };

        case UNREADS_LOADING:
            return {
                ...state,
                unreads_loading: action.unreads_loading
            };

        case UNREADS_REFRESHING:
            return {
                ...state,
                unreads_refreshing: action.unreads_refreshing
            };

        case GET_UNREADS_SUCCESS:
            return {
                ...state,
                unreads: Object.assign({}, action.response)
            };

        default:
            return state;
    }
};
