export const SET_LOADED = 'SET_LOADED';

export function setLoaded(tf) {
    return {
        type: SET_LOADED, loaded: tf
    };
}
