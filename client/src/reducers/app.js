import { SET_LOADED } from '../actions/app';

let initialState = {
    loaded: false
};

export default function user(state = initialState, action) {
    switch (action.type) {

        case SET_LOADED:
            return {
                ...state,
                loaded: action.loaded
            };

        default:
            return state;
    }
};
