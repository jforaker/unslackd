import {
    SET_TOKEN,
    CLEAR_TOKEN,
    GET_UNREADS_SUCCESS,
    GET_UNREADS_ERROR,
    UNREADS_LOADING,
    UNREADS_REFRESHING,
    SHOW_HIDE_FLASH
} from '../actions/user';

let initialState = {
    token: null,
    logged_in: false,
    logging_out: false,
    unreads_loading: false,
    show_flash: false,
    unreads_refreshing: false,
    msg_timestamp: null,
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
                logging_out: true,
                unreads: {}
            };

        case UNREADS_LOADING:
            return {
                ...state,
                unreads_loading: action.unreads_loading
            };

        case UNREADS_REFRESHING:
            return {
                ...state,
                msg_timestamp: action.msg_timestamp,
                unreads_refreshing: action.unreads_refreshing
            };

        case GET_UNREADS_SUCCESS:
            return {
                ...state,
                show_flash: false,
                unreads: Object.assign({}, action.response)
            };

        case GET_UNREADS_ERROR:
            return {
                ...state,
                show_flash: true
            };

        case SHOW_HIDE_FLASH:
            return {
                ...state,
                show_flash: action.show_flash
            };

        default:
            return state;
    }
};
