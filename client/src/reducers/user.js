import { SET_TOKEN, GET_UNREADS_SUCCESS, UNREADS_LOADING } from '../actions/user';

let initialState = {
    token: '',
    logged_in: false,
    unreads_loading: false,
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

        case UNREADS_LOADING:
            return {
                ...state,
                unreads_loading: action.unreads_loading
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
